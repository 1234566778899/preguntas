<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import Countdown from "./ui/Countdown.svelte";
  import Icon from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingRoom from "./WaitingRoom.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import ReportControl from "./ui/ReportControl.svelte";
  import { answeringSeconds, haptic } from "../lib/theme";
  import { dismissKeyboard } from "../lib/actions";
  import { ACCEPTED, ImageError, prepareImage } from "../lib/images";
  import { onDestroy } from "svelte";

  interface Props { game: Game }
  let { game }: Props = $props();

  let index = $state(0);
  let forward = $state(true);
  // Las respuestas viven en memoria hasta el final, así se puede volver atrás
  // y cambiar de opinión antes de enviarlas todas juntas.
  let drafts = $state<Record<string, string>>({});
  // Las fotos ya reducidas, esperando a que se envíe todo junto. `previews`
  // son object URLs para verlas sin subirlas todavía.
  let photos = $state<Record<string, Blob>>({});
  let previews = $state<Record<string, string>>({});
  let preparing = $state(false);
  let picker = $state<HTMLInputElement | null>(null);

  let seconds = $derived(answeringSeconds(game.questions.length));
  let current = $derived(game.questions[index] ?? game.questions[0]);
  let isLast = $derived(index >= game.questions.length - 1);
  let answered = $derived(
    game.questions.filter((q) => (drafts[q.id] ?? "").trim() || photos[q.id]).length,
  );

  function go(step: number) {
    haptic.tap();
    forward = step > 0;
    index = Math.max(0, Math.min(game.questions.length - 1, index + step));
  }

  async function pick(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    // Vaciarlo permite volver a elegir la misma foto después de quitarla.
    input.value = "";
    if (!file) return;

    const questionId = current.id;
    preparing = true;
    try {
      const blob = await prepareImage(file);
      drop(questionId);
      photos = { ...photos, [questionId]: blob };
      previews = { ...previews, [questionId]: URL.createObjectURL(blob) };
      haptic.success();
    } catch (error) {
      game.banner =
        error instanceof ImageError ? error.message : "No se pudo usar esa foto.";
      haptic.failure();
    } finally {
      preparing = false;
    }
  }

  /** Suelta la foto de una pregunta y su object URL, que si no se queda en
   *  memoria hasta recargar. */
  function drop(questionId: string) {
    const preview = previews[questionId];
    if (preview) URL.revokeObjectURL(preview);
    const { [questionId]: _blob, ...restPhotos } = photos;
    const { [questionId]: _url, ...restPreviews } = previews;
    photos = restPhotos;
    previews = restPreviews;
  }

  onDestroy(() => {
    for (const url of Object.values(previews)) URL.revokeObjectURL(url);
  });
</script>

{#if game.didSubmitAnswers}
  <WaitingRoom {game} {seconds}
    title="Respuestas enviadas"
    subtitle="Cuando todos terminen se revela todo de golpe." />
{:else if game.questions.length === 0}
  <div class="loading">
    <Mascot pose="pensando" size={140} idle />
    <WaitingDots />
    <p class="dim">Recogiendo las preguntas…</p>
  </div>
{:else}
  <section class="screen" use:dismissKeyboard>
    <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

    <div class="progress">
      <Countdown {seconds} startedAt={game.phaseStartedAt} />
      <div class="labels">
        <span>Pregunta {index + 1} de {game.questions.length}</span>
        <span class="muted">{answered} contestadas</span>
      </div>
      <div class="rail"><i style="width:{((index + 1) / game.questions.length) * 100}%"></i></div>
    </div>

    <div class="stage">
      {#key current.id}
        <div
          class="sticker qcard"
          in:fly={{ x: forward ? 260 : -260, duration: 380, opacity: 0 }}
          out:fly={{ x: forward ? -260 : 260, duration: 380, opacity: 0 }}
        >
          <div class="head">
            <span class="eyebrow who"><Icon name="mask" size={18} weight={2.2} /> Alguien preguntó</span>
            <ReportControl {game} kind="question" targetId={current.id} />
          </div>
          <h1>{current.text}</h1>
          <hr />
          <textarea
            rows="3"
            placeholder={current.allows_images
              ? "Tu respuesta anónima… o solo la foto"
              : "Tu respuesta anónima…"}
            value={drafts[current.id] ?? ""}
            oninput={(e) => (drafts = { ...drafts, [current.id]: e.currentTarget.value })}
          ></textarea>

          {#if current.allows_images}
            <div class="photo">
              {#if previews[current.id]}
                <div class="thumb">
                  <img src={previews[current.id]} alt="Foto que vas a enviar" />
                  <button class="drop press" aria-label="Quitar la foto"
                    onclick={() => { haptic.tap(); drop(current.id); }}><Icon name="x" size={14} weight={3} /></button>
                </div>
              {:else}
                <button class="chip press attach" disabled={preparing}
                  onclick={() => { haptic.tap(); picker?.click(); }}>
                  <Icon name="camera" size={14} weight={2.6} /> {preparing ? "Preparando…" : "Adjuntar una foto"}
                </button>
              {/if}
              <span class="dim warn">
                Se quita la ubicación y los datos del móvil, pero lo que se ve en
                la foto puede delatarte.
              </span>
            </div>
          {/if}
        </div>
      {/key}
    </div>

    <!-- Uno solo para todas las preguntas, fuera del bloque `{#key}` que se
         reconstruye al pasar de una a otra. -->
    <input class="picker" type="file" accept={ACCEPTED} bind:this={picker} onchange={pick} />

    <footer>
      {#if index > 0}
        <button class="back sticker press" aria-label="Anterior" onclick={() => go(-1)}><Icon name="arrow-left" size={20} weight={3} /></button>
      {/if}
      {#if isLast}
        <Button label="Enviar respuestas" icon="check" enabled={!game.isBusy && !preparing}
          busy={game.isBusy} onclick={() => game.submitAnswers(drafts, photos)} />
      {:else}
        <Button label="Siguiente" icon="arrow-right" onclick={() => go(1)} />
      {/if}
    </footer>
  </section>
{/if}

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .loading { height: 100%; display: grid; place-content: center; justify-items: center; gap: 18px; font-size: 17px; font-weight: 800; }

  .progress { padding: 0 22px 18px; display: grid; gap: 12px; }
  .labels { display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; }

  .stage { flex: 1; position: relative; padding: 0 20px; overflow: hidden; }
  .qcard {
    position: absolute; inset: 0 24px 6px 20px; padding: 22px;
    display: grid; gap: 18px; align-content: start; border-radius: 26px; overflow-y: auto;
  }
  .head { display: flex; align-items: center; justify-content: space-between; }
  .who { display: inline-flex; align-items: center; gap: 8px; }
  h1 { font-size: 24px; font-weight: 900; line-height: 1.25; }
  hr { border: none; height: 1.5px; background: var(--divider); }
  textarea { font-family: var(--mono); font-size: 17px; font-weight: 500; line-height: 1.5; min-height: 100px; }

  .picker { display: none; }
  .photo { display: grid; gap: 10px; justify-items: start; }
  .attach { font-size: 14px; }
  .attach:disabled { opacity: .5; }
  .warn { font-size: 13px; line-height: 1.35; }

  .thumb { position: relative; }
  .thumb img {
    display: block; max-height: 150px; max-width: 100%;
    border-radius: 14px; border: var(--stroke) solid var(--ink);
  }
  .drop {
    position: absolute; top: -10px; right: -10px; width: 30px; height: 30px;
    border-radius: 50%; display: grid; place-items: center;
    background: var(--paper); border: 2px solid var(--ink);
  }

  footer { display: flex; gap: 12px; padding: 12px 22px 16px; }
  .back { --lift: 3px; width: 60px; height: 60px; flex: none; border-radius: 18px; display: grid; place-items: center; }
</style>
