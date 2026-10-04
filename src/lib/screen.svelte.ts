import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { signedImageUrl } from "./storage";
import type { Answer, GamePhase, Player, Question, RevealItem, Room } from "./types";

const KEYS = {
  device: "anonimas.device",
  screen: "anonimas.screen",
};

/**
 * La pantalla grande: una tele o un portátil que enseña la partida al grupo,
 * como en Kahoot. No es un jugador (no cuenta en `players`), así que la fase
 * avanza sin esperarla.
 *
 * Sala y jugadores se leen en abierto, igual que en `Game`. La revelación sale
 * de `screen_reveal` (supabase/pantalla-grande.sql). Si esa función todavía no
 * está en la base, la pantalla sigue sirviendo para el lobby y el progreso, y
 * en la revelación manda mirar los móviles.
 */
export class Screen {
  room = $state<Room | null>(null);
  players = $state<Player[]>([]);
  questions = $state<Question[]>([]);
  answers = $state<Answer[]>([]);
  banner = $state<string | null>(null);
  busy = $state(false);
  /** `false` si la base aún no tiene las funciones de pantalla grande. */
  canReveal = $state(true);
  /** Igual que en `Game`: referencia local de la cuenta atrás. */
  phaseStartedAt = $state(Date.now());
  confettiTrigger = $state(0);

  #deviceId: string;
  #channel: RealtimeChannel | null = null;
  #pending: ReturnType<typeof setTimeout> | null = null;
  #lastPhase: GamePhase | null = null;

  constructor() {
    // El mismo identificador que el juego: si este navegador también juega en
    // la sala, la base ya lo conoce.
    let id = localStorage.getItem(KEYS.device);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEYS.device, id);
    }
    this.#deviceId = id;
  }

  get phase(): GamePhase {
    return this.room?.phase ?? "lobby";
  }

  get savedCode(): string {
    return localStorage.getItem(KEYS.screen) ?? "";
  }

  get readyCount(): number {
    if (this.phase === "asking") return this.players.filter((p) => p.submitted_question).length;
    if (this.phase === "answering") {
      // La pantalla no ve las preguntas mientras se responde; cuántas hay es el
      // número de jugadores, porque cada uno escribe exactamente una.
      const total = this.players.length;
      return this.players.filter((p) => p.answered_count >= total).length;
    }
    return this.players.length;
  }

  hasFinished(player: Player): boolean {
    if (this.phase === "asking") return player.submitted_question;
    if (this.phase === "answering") return player.answered_count >= this.players.length;
    return true;
  }

  get revealItems(): RevealItem[] {
    return this.questions.map((question) => ({
      question,
      answers: this.answers.filter((a) => a.question_id === question.id),
    }));
  }

  imageUrl(path: string): Promise<string | null> {
    return signedImageUrl(path);
  }

  async watch(rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    if (!supabase || code.length !== 5) {
      this.banner = "El código tiene 5 letras.";
      return;
    }

    this.busy = true;
    try {
      let room: Room | null = null;
      const { data, error } = await supabase.rpc("watch_room", {
        p_code: code,
        p_device: this.#deviceId,
      });

      if (error && isMissingFunction(error)) {
        // Sin las funciones nuevas: se busca la sala a mano y se sigue sin revelación.
        this.canReveal = false;
        const { data: rooms } = await supabase
          .from("rooms")
          .select("id,code,phase,round")
          .eq("code", code)
          .limit(1);
        room = (rooms?.[0] as Room | undefined) ?? null;
        if (!room) throw new Error("ROOM_NOT_FOUND");
      } else if (error) {
        throw error;
      } else {
        room = data as Room;
      }

      this.room = room;
      this.#lastPhase = room.phase;
      this.phaseStartedAt = Date.now();
      localStorage.setItem(KEYS.screen, room.code);
      await this.refresh();
      this.#connect(room.id);
    } catch (error) {
      this.banner = describe(error);
    } finally {
      this.busy = false;
    }
  }

  stop() {
    this.#disconnect();
    localStorage.removeItem(KEYS.screen);
    this.room = null;
    this.players = [];
    this.questions = [];
    this.answers = [];
    this.#lastPhase = null;
  }

  async refresh() {
    if (!supabase || !this.room) return;
    const roomId = this.room.id;

    try {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select("id,code,phase,round")
        .eq("id", roomId)
        .limit(1);
      if (error) throw error;

      const fresh = rooms?.[0] as Room | undefined;
      if (!fresh) {
        this.banner = "La sala se cerró.";
        this.stop();
        return;
      }

      const { data: roster, error: rosterError } = await supabase
        .from("players")
        .select("id,room_id,name,avatar,is_host,submitted_question,answered_count")
        .eq("room_id", roomId)
        .order("joined_at");
      if (rosterError) throw rosterError;

      let questions: Question[] = [];
      let answers: Answer[] = [];
      if (fresh.phase === "reveal" && this.canReveal) {
        const { data: reveal, error: revealError } = await supabase.rpc("screen_reveal", {
          p_room: roomId,
          p_device: this.#deviceId,
        });
        if (revealError && isMissingFunction(revealError)) this.canReveal = false;
        else if (revealError) throw revealError;
        else if (reveal) {
          questions = (reveal as { questions: Question[] }).questions;
          answers = (reveal as { answers: Answer[] }).answers;
        }
      }

      const changed = this.#lastPhase !== fresh.phase;
      this.room = fresh;
      this.players = (roster ?? []) as Player[];
      this.questions = questions;
      this.answers = answers;
      if (changed) {
        this.#lastPhase = fresh.phase;
        this.phaseStartedAt = Date.now();
        if (fresh.phase === "reveal") this.confettiTrigger += 1;
      }
    } catch (error) {
      this.banner = describe(error);
    }
  }

  #connect(roomId: string) {
    this.#disconnect();
    if (!supabase) return;
    this.#channel = supabase
      .channel(`pantalla-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        () => this.#schedule(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        () => this.#schedule(),
      )
      .subscribe();
  }

  #disconnect() {
    if (this.#pending) clearTimeout(this.#pending);
    this.#pending = null;
    if (this.#channel) {
      supabase?.removeChannel(this.#channel);
      this.#channel = null;
    }
  }

  #schedule() {
    if (this.#pending) clearTimeout(this.#pending);
    this.#pending = setTimeout(() => void this.refresh(), 90);
  }
}

/** PostgREST responde PGRST202 cuando la función no existe en la base. */
function isMissingFunction(error: { code?: string; message?: string }): boolean {
  return error.code === "PGRST202" || error.code === "42883";
}

function describe(error: unknown): string {
  const text = (error as { message?: string })?.message ?? String(error ?? "");
  if (text.includes("ROOM_NOT_FOUND")) return "No existe ninguna sala con ese código.";
  if (text.includes("GAME_IN_PROGRESS")) {
    return "Esa partida ya empezó. La pantalla grande se conecta en el lobby.";
  }
  if (text.includes("ROOM_FULL")) return "Esa sala ya tiene demasiadas pantallas.";
  if (text.includes("Failed to fetch") || text.includes("NetworkError")) {
    return "Sin conexión. Revisa tu internet.";
  }
  return "Algo salió mal. Inténtalo otra vez.";
}
