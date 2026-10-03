<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import ReportControl from "./ui/ReportControl.svelte";
  import AnswerImage from "./ui/AnswerImage.svelte";
  import { haptic, maskFor, maskTintFor } from "../lib/theme";

  interface Props { game: Game }
  let { game }: Props = $props();

  let page = $state(0);
  let items = $derived(game.revealItems);
  let atEnd = $derived(page >= items.length - 1);

  // Las respuestas no aparecen de golpe: entran una a una. Es el momento bueno
  // de la partida y merece durar un par de segundos.
  let visible = $state(0);

  $effect(() => {
    const item = items[page];
    if (!item) return;
    visible = 0;
    let cancelled = false;
    (async () => {
      for (let step = 1; step <= Math.max(item.answers.length, 1); step++) {
        await new Promise((r) => setTimeout(r, step === 1 ? 220 : 160));
        if (cancelled) return;
        visible = step;
        haptic.tap();
      }
    })();
    return () => { cancelled = true; };
  });

  function turn(step: number) {
    const next = page + step;
    if (next < 0 || next >= items.length) return;
    haptic.tap();
    page = next;
  }

  // En un portátil no hay dedo con el que deslizar: las flechas del teclado son
  // lo que la gente prueba primero.
  function onKey(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") turn(-1);
    else if (event.key === "ArrowRight") turn(1);
  }

  let startX = 0;
  function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 55) turn(dx < 0 ? 1 : -1);
  }
</script>

<svelte:window onkeydown={onKey} />

<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="copy">
    <h1>La verdad</h1>
    <p class="dim">Nadie sabe quién escribió qué</p>
  </div>

  <div class="stage" ontouchstart={onTouchStart} ontouchend={onTouchEnd}>
    {#key page}
      <div class="card rcard" in:fly={{ y: 26, duration: 400 }}>
        <div class="head">
          <span class="chip">? {page + 1} DE {items.length}</span>
          {#if items[page]}
            <ReportControl {game} kind="question" targetId={items[page].question.id} />
          {/if}
        </div>

        <h2>{items[page]?.question.text ?? ""}</h2>
        <hr />

        <div class="answers">
          {#each (items[page]?.answers ?? []).slice(0, visible) as answer (answer.id)}
            <div class="bubble" in:fly={{ y: 24, duration: 380 }}>
              <span class="mask" style="--tint:{maskTintFor(answer.id)}">{maskFor(answer.id)}</span>
              <div class="said">
                {#if answer.text}<p>{answer.text}</p>{/if}
                {#if answer.image_path}
                  <AnswerImage {game} path={answer.image_path} />
                {/if}
              </div>
              <ReportControl {game} kind="answer" targetId={answer.id} />
            </div>
          {/each}
          {#if items[page] && items[page].answers.length === 0}
            <p class="muted">Nadie respondió a esta.</p>
          {/if}
        </div>
      </div>
    {/key}

    <button class="edge left" aria-label="Anterior" onclick={() => turn(-1)} disabled={page === 0}></button>
    <button class="edge right" aria-label="Siguiente" onclick={() => turn(1)} disabled={atEnd}></button>
  </div>

  <!-- Los puntos ya decían por dónde vas; ahora además se puede navegar con
       ellos. Las flechas solo salen con ratón: en un móvil sobran y taparían. -->
  <div class="pager">
    <button class="step press" aria-label="Pregunta anterior"
      disabled={page === 0} onclick={() => turn(-1)}>‹</button>

    <div class="pips">
      {#each items as _, i}
        <span class:on={i === page}></span>
      {/each}
    </div>

    <button class="step press" aria-label="Pregunta siguiente"
      disabled={atEnd} onclick={() => turn(1)}>›</button>
  </div>

  <footer>
    {#if atEnd}
      {#if game.isHost}
        <Button label="Otra ronda" icon="↻" enabled={!game.isBusy} busy={game.isBusy}
          onclick={() => game.playAgain()} />
      {:else}
        <div class="waiting card">
          <WaitingDots />
          <span class="dim">Quien creó la sala decide si hay otra</span>
        </div>
      {/if}
    {:else}
      <p class="muted hint">
        <span class="on-touch">Desliza para seguir →</span>
        <span class="on-mouse">Usa las flechas para seguir</span>
      </p>
    {/if}
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .copy { text-align: center; padding-bottom: 18px; }
  h1 { font-size: 28px; font-weight: 900; }
  .copy p { font-size: 12px; margin-top: 6px; }

  .stage { flex: 1; position: relative; padding: 0 20px; overflow: hidden; }
  .rcard {
    position: absolute; inset: 0 20px; padding: 24px; border-radius: 32px;
    display: grid; gap: 18px; grid-template-rows: auto auto auto 1fr;
  }
  .head { display: flex; align-items: center; justify-content: space-between; }
  h2 { font-size: 25px; font-weight: 900; line-height: 1.25; }
  hr { border: none; height: 1px; background: var(--stroke); }
  .answers { overflow-y: auto; display: grid; gap: 12px; align-content: start; }

  .bubble { display: flex; gap: 12px; align-items: start; }
  .mask {
    width: 38px; height: 38px; flex: none; border-radius: 50%; display: grid; place-items: center;
    font-size: 20px; background: color-mix(in srgb, var(--tint) 28%, transparent);
    border: 1px solid color-mix(in srgb, var(--tint) 50%, transparent);
  }
  /* La respuesta puede ser texto, foto o las dos: por eso el envoltorio, que
     antes no hacía falta. */
  .said { flex: 1; min-width: 0; display: grid; gap: 8px; }
  .said p {
    font-size: 17px; font-weight: 600; line-height: 1.4;
    padding: 11px 14px; border-radius: 18px;
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
  }

  /* Zonas de toque en los bordes, para quien no llegue a deslizar. Solo con
     dedo: con ratón están las flechas, y un clic invisible sobre una foto que
     pasa de pregunta es de las cosas que más molestan. */
  .edge { position: absolute; top: 0; bottom: 0; width: 56px; opacity: 0; }
  .edge:disabled { pointer-events: none; }
  .left { left: 0; }
  .right { right: 0; }
  @media (hover: hover) and (pointer: fine) {
    .edge { display: none; }
  }

  .pager { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 14px 0; }
  .step {
    display: none;
    width: 34px; height: 34px; flex: none; border-radius: 50%;
    font-size: 19px; font-weight: 700; line-height: 1;
    background: rgba(255,255,255,.1); border: 1px solid var(--stroke); color: var(--text);
    transition: opacity var(--pop), background var(--pop);
  }
  .step:hover:not(:disabled) { background: rgba(255,255,255,.2); }
  .step:disabled { opacity: .25; cursor: default; }
  @media (hover: hover) and (pointer: fine) {
    .step { display: grid; place-items: center; }
  }

  .pips { display: flex; gap: 7px; justify-content: center; }
  .pips span {
    width: 7px; height: 7px; border-radius: 999px; background: rgba(255,255,255,.25);
    transition: width var(--pop), background var(--pop);
  }
  .pips span.on { width: 22px; background: rgba(255,255,255,.95); }

  footer { padding: 0 22px 16px; min-height: 74px; display: grid; place-items: center; }
  footer :global(.btn) { width: 100%; }
  .waiting { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 58px; border-radius: 29px; font-size: 14px; }
  .hint { font-size: 14px; }
  .on-mouse { display: none; }
  @media (hover: hover) and (pointer: fine) {
    .on-touch { display: none; }
    .on-mouse { display: inline; }
  }
</style>
