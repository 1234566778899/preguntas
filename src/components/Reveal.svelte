<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import Icon from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import ReportControl from "./ui/ReportControl.svelte";
  import AnswerSlip from "./ui/AnswerSlip.svelte";
  import { haptic } from "../lib/theme";
  import { RevealSequence } from "../lib/reveal.svelte";
  import { stamp, tiltFor } from "../lib/transitions";

  interface Props { game: Game }
  let { game }: Props = $props();

  const reveal = new RevealSequence(() => game.revealItems);
  let item = $derived(reveal.current);

  // En un portátil no hay dedo con el que deslizar: las flechas del teclado son
  // lo que la gente prueba primero. La barra espaciadora hace lo de tocar.
  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, [role=dialog]")) return;
    if (event.key === "ArrowLeft") reveal.turn(-1);
    else if (event.key === "ArrowRight") reveal.turn(1);
    else if (event.key === " ") { event.preventDefault(); reveal.advance(); }
  }

  let startX = 0;
  function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 55) reveal.turn(dx < 0 ? 1 : -1);
  }

  // Igual que ShareText.question: solo la pregunta y las respuestas, que ya son
  // anónimas. No hay nombres que filtrar.
  async function share() {
    if (!item) return;
    haptic.tap();
    const lines = item.answers.filter((a) => a.text && a.text !== "🤐").map((a) => `— ${a.text}`);
    const text = `${item.question.text}\n\n${lines.join("\n")}\n\nTodo es anónimo. Jugado en Anónimas: ${location.origin}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelado */ }
    } else {
      try { await navigator.clipboard.writeText(text); game.banner = "Copiado para compartir."; } catch { /* da igual */ }
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="copy">
    <Mascot pose="celebrando" size={72} />
    <h1 class="title">La verdad</h1>
    <p class="dim">Nadie sabe quién escribió qué</p>
  </div>

  <div class="stage" ontouchstart={onTouchStart} ontouchend={onTouchEnd}>
    {#key reveal.page}
      <div class="sticker rcard" in:fly={{ y: 30, duration: 420 }}>
        <div class="head">
          <span class="chip"><Icon name="question" size={13} weight={3} /> {reveal.page + 1} DE {reveal.items.length}</span>
          <span class="tools">
            <button class="tool press" aria-label="Compartir pregunta y respuestas" onclick={share}>
              <Icon name="share" size={16} weight={2.6} />
            </button>
            {#if item}<ReportControl {game} kind="question" targetId={item.question.id} />{/if}
          </span>
        </div>

        <h2 class:alone={reveal.stage === "suspense"}>{item?.question.text ?? ""}</h2>

        <!-- Tocar la tarjeta enseña lo que queda: para quien no quiere esperar. -->
        <div class="answers" role="button" tabindex="-1" onclick={() => !reveal.allShown && reveal.skip()}
          onkeydown={() => {}}>
          {#if reveal.stage === "suspense"}
            <div class="drumroll" in:fly={{ y: 10, duration: 250 }}>
              <WaitingDots />
              <span>Las respuestas son…</span>
            </div>
          {:else}
            {#each (item?.answers ?? []).slice(0, reveal.visible) as answer (answer.id)}
              <div in:stamp={{ tilt: tiltFor(answer.id, 1.2) }}>
                <AnswerSlip {answer} {game} imageUrl={(p) => game.imageUrl(p)} />
              </div>
            {/each}
            {#if item && item.answers.length === 0}
              <p class="dim">Nadie respondió a esta.</p>
            {/if}
          {/if}
        </div>
      </div>
    {/key}

    <button class="edge left" aria-label="Anterior" onclick={() => reveal.turn(-1)} disabled={reveal.page === 0}></button>
    <button class="edge right" aria-label="Siguiente" onclick={() => reveal.turn(1)} disabled={reveal.atEnd}></button>
  </div>

  <!-- Los puntos dicen por dónde vas. Las flechas solo salen con ratón: en un
       móvil sobran y taparían. -->
  <div class="pager">
    <button class="step sticker press" aria-label="Pregunta anterior"
      disabled={reveal.page === 0} onclick={() => reveal.turn(-1)}><Icon name="chevron-left" size={16} weight={3} /></button>

    <div class="pips" aria-label="Pregunta {reveal.page + 1} de {reveal.items.length}">
      {#each reveal.items as _, i}
        <span class:on={i === reveal.page}></span>
      {/each}
    </div>

    <button class="step sticker press" aria-label="Pregunta siguiente"
      disabled={reveal.atEnd} onclick={() => reveal.turn(1)}><Icon name="chevron-right" size={16} weight={3} /></button>
  </div>

  <footer>
    {#if reveal.atEnd && reveal.allShown}
      {#if game.isHost}
        <Button label="Otra ronda" icon="refresh" enabled={!game.isBusy} busy={game.isBusy}
          onclick={() => game.playAgain()} />
      {:else}
        <div class="waiting sticker">
          <WaitingDots />
          <span>Quien creó la sala decide si hay otra</span>
        </div>
      {/if}
    {:else if !reveal.allShown}
      <button class="chip press" onclick={() => reveal.skip()}>
        <Icon name="skip" size={13} weight={2.6} /> Ver todas ya
      </button>
    {:else}
      <p class="hint">
        <span class="on-touch">Desliza para seguir</span>
        <span class="on-mouse">Usa las flechas para seguir</span>
        <Icon name="arrow-right" size={16} weight={3} />
      </p>
    {/if}
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .copy { text-align: center; padding-bottom: 14px; display: grid; justify-items: center; gap: 2px; }
  .copy p { font-size: 14px; font-weight: 700; }

  .stage { flex: 1; position: relative; padding: 0 20px; overflow: hidden; }
  .rcard {
    position: absolute; inset: 0 24px 6px 20px; padding: 20px; border-radius: 26px;
    display: grid; gap: 16px; grid-template-rows: auto auto 1fr;
  }
  .head { display: flex; align-items: center; justify-content: space-between; }
  .tools { display: flex; align-items: center; gap: 2px; }
  .tool { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; }

  /* Sola, la pregunta ocupa el centro; al llegar las respuestas se encoge a su sitio. */
  h2 { font-size: 23px; font-weight: 900; line-height: 1.25; transition: font-size var(--glide); }
  h2.alone { font-size: 27px; }

  .answers { overflow-y: auto; display: grid; gap: 12px; align-content: start; padding: 2px 4px 8px 0; outline: none; }
  .drumroll { display: flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 800; color: var(--text-2); padding-top: 8px; }

  /* Zonas de toque en los bordes, para quien no llegue a deslizar. Solo con
     dedo: con ratón están las flechas. */
  .edge { position: absolute; top: 0; bottom: 0; width: 40px; opacity: 0; }
  .edge:disabled { pointer-events: none; }
  .left { left: 0; }
  .right { right: 0; }
  @media (hover: hover) and (pointer: fine) {
    .edge { display: none; }
  }

  .pager { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 14px 0; }
  .step {
    --lift: 2px;
    display: none; width: 36px; height: 36px; flex: none; border-radius: 50%;
  }
  .step:disabled { opacity: .3; cursor: default; }
  @media (hover: hover) and (pointer: fine) {
    .step { display: grid; place-items: center; }
  }

  .pips { display: flex; gap: 7px; justify-content: center; }
  .pips span {
    width: 7px; height: 7px; border-radius: 999px; background: rgba(20,20,20,.28);
    transition: width var(--pop), background var(--pop);
  }
  .pips span.on { width: 22px; background: var(--ink); }

  footer { padding: 0 22px 16px; min-height: 74px; display: grid; place-items: center; }
  footer :global(.btn) { width: 100%; }
  .waiting { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 58px; border-radius: 18px; font-size: 15px; font-weight: 900; padding: 0 12px; }
  .hint { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 900; }
  .on-mouse { display: none; }
  @media (hover: hover) and (pointer: fine) {
    .on-touch { display: none; }
    .on-mouse { display: inline; }
  }
</style>
