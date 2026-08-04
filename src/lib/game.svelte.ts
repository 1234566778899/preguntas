import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isConfigured } from "./supabase";
import { paletteFor, palettes, randomAvatar, haptic, type Palette } from "./theme";
import type {
  Answer,
  GamePhase,
  Player,
  Question,
  ReportKind,
  RevealItem,
  Room,
  RoomEntry,
} from "./types";

type Route = "home" | "join" | "game";

const KEYS = {
  device: "anonimas.device",
  name: "anonimas.name",
  avatar: "anonimas.avatar",
  room: "anonimas.room",
  terms: "anonimas.terms",
};

/**
 * Mismo motor que Anonimas/Services/GameStore.swift, con runes de Svelte 5 en
 * lugar de @Observable.
 *
 * Igual que en la app, los eventos de tiempo real se usan solo como *aviso*:
 * cuando algo cambia en la sala se vuelven a pedir los datos. Una petición de
 * más a cambio de que todos vean exactamente lo mismo.
 */
export class Game {
  route = $state<Route>("home");
  room = $state<Room | null>(null);
  players = $state<Player[]>([]);
  questions = $state<Question[]>([]);
  answers = $state<Answer[]>([]);
  myPlayerId = $state<string | null>(null);

  name = $state("");
  avatar = $state(0);
  banner = $state<string | null>(null);
  hasAcceptedTerms = $state(false);
  confettiTrigger = $state(0);
  readonly isConfigured = isConfigured;

  /** Contador y no booleano: con dos operaciones solapadas un booleano se atasca. */
  #busy = $state(0);
  #deviceId: string;
  #channel: RealtimeChannel | null = null;
  #pendingRefresh: ReturnType<typeof setTimeout> | null = null;
  #lastPhase: GamePhase | null = null;

  constructor() {
    this.#deviceId = this.#loadDeviceId();
    this.name = localStorage.getItem(KEYS.name) ?? "";
    this.hasAcceptedTerms = localStorage.getItem(KEYS.terms) === "1";

    const storedAvatar = localStorage.getItem(KEYS.avatar);
    if (storedAvatar !== null) {
      this.avatar = Number(storedAvatar);
    } else {
      // Guardarlo la primera vez, o te toca una cara distinta en cada visita.
      this.avatar = randomAvatar();
      localStorage.setItem(KEYS.avatar, String(this.avatar));
    }
  }

  #loadDeviceId(): string {
    const stored = localStorage.getItem(KEYS.device);
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEYS.device, fresh);
    return fresh;
  }

  // ------------------------------------------------------------- derivados

  get isBusy() {
    return this.#busy > 0;
  }

  get me(): Player | undefined {
    return this.players.find((p) => p.id === this.myPlayerId);
  }

  get isHost() {
    return this.me?.is_host ?? false;
  }

  get phase(): GamePhase {
    return this.room?.phase ?? "lobby";
  }

  get palette(): Palette {
    return this.route === "game" ? paletteFor(this.phase) : palettes.home;
  }

  get canStart() {
    return this.isHost && this.players.length >= 2;
  }

  get didSubmitQuestion() {
    return this.me?.submitted_question ?? false;
  }

  get didSubmitAnswers() {
    return (this.me?.answered_count ?? 0) > 0;
  }

  get readyCount(): number {
    if (this.phase === "asking") {
      return this.players.filter((p) => p.submitted_question).length;
    }
    if (this.phase === "answering") {
      const total = this.questions.length;
      return total === 0
        ? 0
        : this.players.filter((p) => p.answered_count >= total).length;
    }
    return this.players.length;
  }

  hasFinished(player: Player): boolean {
    if (this.phase === "asking") return player.submitted_question;
    if (this.phase === "answering") {
      return player.answered_count >= Math.max(this.questions.length, 1);
    }
    return true;
  }

  get revealItems(): RevealItem[] {
    return this.questions.map((question) => ({
      question,
      answers: this.answers.filter((a) => a.question_id === question.id),
    }));
  }

  // --------------------------------------------------------------- acciones

  acceptTerms() {
    localStorage.setItem(KEYS.terms, "1");
    this.hasAcceptedTerms = true;
    haptic.success();
  }

  setName(value: string) {
    this.name = value;
    localStorage.setItem(KEYS.name, value);
  }

  setAvatar(index: number) {
    this.avatar = index;
    localStorage.setItem(KEYS.avatar, String(index));
  }

  async createRoom() {
    await this.#run(async () => {
      const entry = await this.#rpc<RoomEntry>("create_room", {
        p_device: this.#deviceId,
        p_name: this.#cleanName,
        p_avatar: this.avatar,
      });
      await this.#enter(entry);
    });
  }

  async joinRoom(rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    if (code.length !== 5) {
      this.banner = "El código tiene 5 letras.";
      haptic.failure();
      return;
    }
    await this.#run(async () => {
      const entry = await this.#rpc<RoomEntry>("join_room", {
        p_code: code,
        p_device: this.#deviceId,
        p_name: this.#cleanName,
        p_avatar: this.avatar,
      });
      await this.#enter(entry);
    });
  }

  async startGame() {
    if (!this.room) return;
    await this.#run(() =>
      this.#rpc("start_game", { p_room: this.room!.id, p_device: this.#deviceId }),
    );
    await this.refresh();
  }

  async submitQuestion(text: string) {
    const clean = text.trim();
    if (!this.room || !clean) return;
    await this.#run(async () => {
      await this.#rpc("submit_question", {
        p_room: this.room!.id,
        p_device: this.#deviceId,
        p_text: clean,
      });
      haptic.success();
    });
    await this.refresh();
  }

  async submitAnswers(drafts: Record<string, string>) {
    if (!this.room) return;
    // Una entrada por pregunta aunque esté vacía: el contador del servidor tiene
    // que cuadrar con el número de preguntas para que avance la fase.
    const p_answers = this.questions.map((q) => ({
      question_id: q.id,
      text: (drafts[q.id] ?? "").trim() || "🤐",
    }));
    await this.#run(async () => {
      await this.#rpc("submit_answers", {
        p_room: this.room!.id,
        p_device: this.#deviceId,
        p_answers,
      });
      haptic.success();
    });
    await this.refresh();
  }

  async playAgain() {
    if (!this.room) return;
    await this.#run(() =>
      this.#rpc("play_again", { p_room: this.room!.id, p_device: this.#deviceId }),
    );
    await this.refresh();
  }

  async report(kind: ReportKind, targetId: string, reason: string) {
    if (!this.room) return;
    await this.#run(async () => {
      await this.#rpc("report_content", {
        p_room: this.room!.id,
        p_device: this.#deviceId,
        p_kind: kind,
        p_target: targetId,
        p_reason: reason,
      });
      haptic.success();
    });
  }

  async leave() {
    if (this.room) {
      // Si falla da igual: el jugador sale igualmente de su lado.
      await this.#rpc("leave_room", {
        p_room: this.room.id,
        p_device: this.#deviceId,
      }).catch(() => {});
    }
    this.#reset();
  }

  // ---------------------------------------------------------------- sesión

  /** Al abrir la web, si quedó una partida a medias se vuelve a entrar solo. */
  async restoreSession() {
    const code = localStorage.getItem(KEYS.room);
    if (!supabase || this.room || !code) return;

    await this.joinRoom(code);

    if (!this.room) {
      localStorage.removeItem(KEYS.room);
      this.banner = null;
    }
  }

  async #enter(entry: RoomEntry) {
    this.room = entry.room;
    this.myPlayerId = entry.player.id;
    this.#lastPhase = entry.room.phase;
    localStorage.setItem(KEYS.room, entry.room.code);
    this.route = "game";
    haptic.success();

    // Los datos primero. Suscribirse al canal tarda, y mientras tanto el lobby
    // se vería vacío y sin corona, como si no fueras el anfitrión.
    await this.refresh();
    this.#connect(entry.room.id);
  }

  #reset() {
    this.#disconnect();
    localStorage.removeItem(KEYS.room);
    this.room = null;
    this.players = [];
    this.questions = [];
    this.answers = [];
    this.myPlayerId = null;
    this.#lastPhase = null;
    this.route = "home";
  }

  // ------------------------------------------------------------- lectura

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
        this.#reset();
        return;
      }

      const { data: roster, error: rosterError } = await supabase
        .from("players")
        .select("id,room_id,name,avatar,is_host,submitted_question,answered_count")
        .eq("room_id", roomId)
        .order("joined_at");
      if (rosterError) throw rosterError;

      // El contenido no se lee de las tablas: las funciones comprueban que eres
      // de la sala, no sueltan nada antes de tiempo y devuelven todo barajado.
      const credentials = { p_room: roomId, p_device: this.#deviceId };

      let questions: Question[] = [];
      if (fresh.phase === "answering" || fresh.phase === "reveal") {
        questions = await this.#rpc<Question[]>("get_questions", credentials);
      }

      let answers: Answer[] = [];
      if (fresh.phase === "reveal") {
        answers = await this.#rpc<Answer[]>("get_answers", credentials);
      }

      this.#apply(fresh, (roster ?? []) as Player[], questions, answers);
    } catch (error) {
      this.banner = describe(error);
    }
  }

  #apply(room: Room, players: Player[], questions: Question[], answers: Answer[]) {
    const phaseChanged = this.#lastPhase !== room.phase;

    this.room = room;
    this.players = players;
    this.questions = questions;
    this.answers = answers;

    if (!phaseChanged) return;

    this.#lastPhase = room.phase;
    if (room.phase === "reveal") {
      haptic.success();
      this.confettiTrigger += 1;
    } else if (room.phase === "lobby") {
      haptic.tap();
    } else {
      haptic.thud();
    }
  }

  // ----------------------------------------------------------- tiempo real

  #connect(roomId: string) {
    this.#disconnect();
    if (!supabase) return;

    // Solo `rooms` y `players`: estado y contadores, sin texto. Las preguntas ya
    // no viajan por aquí (delataban a su autor) y tampoco hacen falta: aparecen
    // todas juntas al cambiar de fase, y ese cambio llega por `rooms`.
    this.#channel = supabase
      .channel(`sala-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        () => this.#scheduleRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        () => this.#scheduleRefresh(),
      )
      .subscribe();
  }

  #disconnect() {
    if (this.#pendingRefresh) clearTimeout(this.#pendingRefresh);
    this.#pendingRefresh = null;
    if (this.#channel) {
      supabase?.removeChannel(this.#channel);
      this.#channel = null;
    }
  }

  /** Cuando entran cinco jugadores a la vez llegan cinco eventos seguidos.
   *  Este pequeño retraso los junta en una sola recarga. */
  #scheduleRefresh() {
    if (this.#pendingRefresh) clearTimeout(this.#pendingRefresh);
    this.#pendingRefresh = setTimeout(() => void this.refresh(), 90);
  }

  /** Al volver de otra pestaña puede haberse perdido algún evento. */
  async resume() {
    if (this.room) await this.refresh();
  }

  // -------------------------------------------------------------- utilidades

  get #cleanName(): string {
    const trimmed = this.name.trim();
    return trimmed ? trimmed.slice(0, 24) : "Anónimo";
  }

  async #rpc<T>(fn: string, params: Record<string, unknown>): Promise<T> {
    if (!supabase) throw new Error("SIN_CONFIGURAR");
    const { data, error } = await supabase.rpc(fn, params);
    if (error) throw error;
    return data as T;
  }

  async #run(work: () => Promise<unknown>) {
    this.#busy += 1;
    try {
      await work();
    } catch (error) {
      this.banner = describe(error);
      haptic.failure();
    } finally {
      this.#busy -= 1;
    }
  }
}

/** Los `raise exception` del SQL llegan aquí como texto. Mismas frases que la app. */
function describe(error: unknown): string {
  const text =
    (error as { message?: string })?.message ?? String(error ?? "");

  if (text.includes("ROOM_NOT_FOUND")) return "No existe ninguna sala con ese código.";
  if (text.includes("GAME_IN_PROGRESS")) return "Esa partida ya empezó. Espera a la siguiente.";
  if (text.includes("ROOM_FULL")) return "La sala está llena (máximo 12).";
  if (text.includes("NEED_MORE_PLAYERS")) return "Hacen falta al menos 2 jugadores.";
  if (text.includes("NOT_HOST")) return "Solo quien creó la sala puede hacer eso.";
  if (text.includes("WRONG_PHASE")) return "Esa jugada ya no toca.";
  if (text.includes("TOO_MANY_REPORTS")) return "Demasiadas denuncias seguidas. Prueba más tarde.";
  if (text.includes("Failed to fetch") || text.includes("NetworkError")) {
    return "Sin conexión. Revisa tu internet.";
  }
  return "Algo salió mal. Inténtalo otra vez.";
}
