<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import ReportControl from "./ui/ReportControl.svelte";
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

  let startX = 0;
  function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 55) turn(dx < 0 ? 1 : -1);
  }
</script>

<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="copy">
    <h1>La verdad</h1>
    <p class="dim">Nadie firmó nada de esto</p>
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
              <p>{answer.text}</p>
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

  <div class="pips">
    {#each items as _, i}
      <span class:on={i === page}></span>
    {/each}
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
      <p class="muted hint">Desliza para seguir →</p>
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
  .bubble p {
    flex: 1; font-size: 17px; font-weight: 600; line-height: 1.4;
    padding: 11px 14px; border-radius: 18px;
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
  }

  /* Zonas de clic en los bordes: en escritorio no hay dedo para deslizar. */
  .edge { position: absolute; top: 0; bottom: 0; width: 56px; opacity: 0; }
  .edge:disabled { pointer-events: none; }
  .left { left: 0; }
  .right { right: 0; }

  .pips { display: flex; gap: 7px; justify-content: center; padding: 14px 0; }
  .pips span {
    width: 7px; height: 7px; border-radius: 999px; background: rgba(255,255,255,.25);
    transition: width var(--pop), background var(--pop);
  }
  .pips span.on { width: 22px; background: rgba(255,255,255,.95); }

  footer { padding: 0 22px 16px; min-height: 74px; display: grid; place-items: center; }
  footer :global(.btn) { width: 100%; }
  .waiting { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 58px; border-radius: 29px; font-size: 14px; }
  .hint { font-size: 14px; }
</style>
