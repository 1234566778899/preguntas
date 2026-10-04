<script lang="ts">
  import { onMount } from "svelte";
  import { fly, scale } from "svelte/transition";
  import type { Screen } from "../lib/screen.svelte";
  import Button from "./ui/Button.svelte";
  import CodeInput from "./ui/CodeInput.svelte";
  import Countdown from "./ui/Countdown.svelte";
  import Icon from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import QrCode from "./ui/QrCode.svelte";
  import AnswerSlip from "./ui/AnswerSlip.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import PlayerTile from "./PlayerTile.svelte";
  import { joinUrl } from "../lib/links";
  import { answeringSeconds, timers } from "../lib/theme";
  import { RevealSequence } from "../lib/reveal.svelte";
  import { bounceIn, stamp, tiltFor } from "../lib/transitions";

  interface Props { screen: Screen; initialCode?: string; onexit: () => void }
  let { screen, initialCode = "", onexit }: Props = $props();

  let code = $state(initialCode || screen.savedCode);

  // Una tele se queda encendida: si se recarga la pestaña, vuelve sola a la sala.
  onMount(() => {
    if (code.length === 5 && !screen.room) void screen.watch(code);
  });

  // En una tele se lee de lejos y a la vez: más tiempo para cada respuesta.
  const reveal = new RevealSequence(() => screen.revealItems, { suspense: 2200, step: 1100 });
  let item = $derived(reveal.current);
  // La vista sigue montada entre rondas: cada revelación empieza por la primera.
  $effect(() => {
    if (screen.phase !== "reveal") reveal.page = 0;
  });

  let host = $derived(location.host);
  let link = $derived(screen.room ? joinUrl(screen.room.code) : "");

  function onKey(event: KeyboardEvent) {
    if (screen.phase !== "reveal") return;
    if ((event.target as HTMLElement | null)?.closest("input")) return;
    if (event.key === "ArrowLeft") reveal.turn(-1);
    else if (event.key === "ArrowRight" || event.key === "PageDown") reveal.turn(1);
    else if (event.key === " " || event.key === "Enter") { event.preventDefault(); reveal.advance(); }
  }

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* el navegador no deja: da igual */ }
  }

  function leave() {
    screen.stop();
    onexit();
  }

  let title = $derived(
    screen.phase === "asking" ? "Todos escriben su pregunta"
    : screen.phase === "answering" ? "Todos responden"
    : "",
  );
</script>

<svelte:window onkeydown={onKey} />

<section class="tv">
  <header>
    <span class="logo">ANÓNIMAS</span>
    {#if screen.room}
      <span class="chip upper">Ronda {screen.room.round} · Sala {screen.room.code}</span>
    {/if}
    <span class="tools">
      <button class="round sticker press" aria-label="Pantalla completa" onclick={fullscreen}>
        <Icon name="expand" size={20} weight={2.8} />
      </button>
      <button class="round sticker press" aria-label="Salir de la pantalla grande" onclick={leave}>
        <Icon name="x" size={20} weight={3} />
      </button>
    </span>
  </header>

  {#if !screen.room}
    <!-- ------------------------------------------------------------ conectar -->
    <div class="connect">
      <Mascot pose="hola" size={160} idle />
      <h1 class="display">Pantalla grande</h1>
      <p class="lead dim">
        Pon la partida en una tele o un portátil para que todo el grupo la vea.
        Escribe el código de una sala que esté en el lobby. Aquí no se juega:
        cada quien juega desde su móvil.
      </p>
      <CodeInput bind:code big onsubmit={() => screen.watch(code)} />
      <div class="go">
        <Button label="Conectar" icon="tv" enabled={code.length === 5 && !screen.busy}
          busy={screen.busy} onclick={() => screen.watch(code)} />
      </div>
    </div>

  {:else if screen.phase === "lobby"}
    <!-- --------------------------------------------------------------- lobby -->
    <div class="lobby">
      <div class="invite sticker">
        <p class="eyebrow big-eyebrow">Entra en <b>{host}</b> con el código</p>
        <div class="letters">
          {#each screen.room.code.split("") as letter, i}
            <span in:fly={{ y: 40, duration: 500, delay: i * 90 }}>{letter}</span>
          {/each}
        </div>
        <div class="qr-row">
          <QrCode text={link} size={200} />
          <p class="dim">O escanea con la cámara del móvil y entras directo.</p>
        </div>
      </div>

      <div class="crowd">
        <div class="crowd-head">
          <h2 class="display">En la sala</h2>
          {#key screen.players.length}
            <span class="count sticker" in:scale={{ start: 1.6, duration: 420 }}>
              <Icon name="users" size={30} weight={2.6} /> {screen.players.length}
            </span>
          {/key}
        </div>
        {#if screen.players.length === 0}
          <div class="empty">
            <WaitingDots />
            <span>Esperando a la primera persona…</span>
          </div>
        {/if}
        <div class="grid">
          {#each screen.players as player, i (player.id)}
            <div in:bounceIn={{ delay: Math.min(i, 8) * 80, tilt: tiltFor(player.id, 16) }}
              out:scale={{ duration: 250, start: 0.5 }}>
              <PlayerTile {player} size={104} />
            </div>
          {/each}
        </div>
        <p class="footnote">
          <Mascot pose="esperando" size={70} idle />
          Quien creó la sala empieza la partida desde su móvil.
        </p>
      </div>
    </div>

  {:else if screen.phase === "asking" || screen.phase === "answering"}
    <!-- ------------------------------------------------- preguntar / responder -->
    <div class="working">
      <div class="working-head">
        <Mascot pose="pensando" size={150} idle />
        <div>
          <h1 class="display">{title}</h1>
          <p class="lead dim">
            {screen.phase === "asking"
              ? "Nadie sabrá cuál escribió cada quien."
              : "Cuando todos terminen, se revela todo aquí."}
          </p>
        </div>
      </div>

      <Countdown big startedAt={screen.phaseStartedAt}
        seconds={screen.phase === "asking" ? timers.asking : answeringSeconds(screen.players.length)} />

      <p class="ready display">{screen.readyCount} de {screen.players.length} listos</p>

      <div class="grid wide">
        {#each screen.players as player (player.id)}
          <PlayerTile {player} size={96} done={screen.hasFinished(player)} />
        {/each}
      </div>
    </div>

  {:else if !screen.canReveal}
    <!-- ------------------------------------------- revelación sin las funciones -->
    <div class="connect">
      <Mascot pose="celebrando" size={200} idle />
      <h1 class="display">¡Llegó la verdad!</h1>
      <p class="lead dim">Miren los móviles: las respuestas ya están ahí.</p>
    </div>

  {:else}
    <!-- ---------------------------------------------------------- revelación -->
    <div class="reveal">
      <div class="reveal-head">
        <span class="chip big-chip"><Icon name="question" size={20} weight={3} /> {reveal.page + 1} de {reveal.items.length}</span>
        <div class="pips">
          {#each reveal.items as _, i}<span class:on={i === reveal.page}></span>{/each}
        </div>
      </div>

      {#key reveal.page}
        <div class="question sticker" class:alone={reveal.stage === "suspense"} in:fly={{ y: 40, duration: 500 }}>
          <Mascot pose={reveal.stage === "suspense" ? "pensando" : "celebrando"} size={110} />
          <h1>{item?.question.text ?? ""}</h1>
        </div>

        <div class="answers">
          {#if reveal.stage === "suspense"}
            <div class="drumroll" in:fly={{ y: 16, duration: 300 }}>
              <WaitingDots />
              <span class="display">Las respuestas son…</span>
            </div>
          {:else}
            {#each (item?.answers ?? []).slice(0, reveal.visible) as answer (answer.id)}
              <div in:stamp={{ duration: 520, tilt: tiltFor(answer.id, 1.5) }}>
                <AnswerSlip {answer} big imageUrl={(p) => screen.imageUrl(p)} />
              </div>
            {/each}
            {#if item && item.answers.length === 0}
              <p class="lead dim">Nadie respondió a esta.</p>
            {/if}
          {/if}
        </div>
      {/key}

      <footer class="controls">
        <button class="ctl sticker press" disabled={reveal.page === 0} onclick={() => reveal.turn(-1)}>
          <Icon name="arrow-left" size={22} weight={3} /> Anterior
        </button>
        <button class="ctl main sticker press" onclick={() => reveal.advance()}
          disabled={reveal.atEnd && reveal.allShown}>
          {#if !reveal.allShown}
            <Icon name="skip" size={22} weight={2.6} /> Ver todas
          {:else if reveal.atEnd}
            Fin de la ronda
          {:else}
            Siguiente <Icon name="arrow-right" size={22} weight={3} />
          {/if}
        </button>
        <span class="keys dim">Espacio o flechas del teclado</span>
      </footer>
    </div>
  {/if}
</section>

<style>
  .tv {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: clamp(14px, 2.4vw, 36px) clamp(16px, 3.4vw, 56px);
    gap: clamp(12px, 2vw, 28px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  header { display: flex; align-items: center; gap: 16px; }
  .logo { font-family: var(--logo); font-weight: 900; font-size: clamp(24px, 2.6vw, 40px); }
  .upper { text-transform: uppercase; font-size: clamp(13px, 1.1vw, 18px); padding: 8px 16px; }
  .tools { margin-left: auto; display: flex; gap: 12px; }
  .round { --lift: 3px; width: 50px; height: 50px; border-radius: 50%; display: grid; place-items: center; }

  .display { font-family: var(--display); font-weight: 400; }
  .lead { font-size: clamp(17px, 1.6vw, 26px); line-height: 1.4; font-weight: 700; max-width: 46ch; }

  /* --- conectar */
  .connect { flex: 1; display: grid; align-content: center; justify-items: center; gap: 22px; text-align: center; }
  .connect h1 { font-size: clamp(36px, 5vw, 72px); }
  .go { width: min(420px, 100%); }

  /* --- lobby */
  .lobby { flex: 1; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(16px, 3vw, 48px); align-items: start; }
  .invite { padding: clamp(20px, 2.6vw, 40px); display: grid; gap: 24px; justify-items: center; text-align: center; border-radius: 30px; --lift: 6px; }
  .big-eyebrow { font-size: clamp(14px, 1.3vw, 20px); text-transform: none; letter-spacing: 0; color: var(--text); font-weight: 700; }
  .big-eyebrow b { font-weight: 900; }
  .letters { display: flex; gap: clamp(8px, 1vw, 16px); }
  .letters span {
    width: clamp(56px, 6.4vw, 110px); height: clamp(72px, 8.4vw, 140px); border-radius: 18px;
    display: grid; place-items: center; background: var(--yellow); border: 3px solid var(--ink);
    box-shadow: 5px 5px 0 var(--ink);
    font-family: var(--display); font-size: clamp(40px, 5vw, 86px);
  }
  .qr-row { display: flex; align-items: center; gap: 20px; text-align: left; }
  .qr-row p { font-size: clamp(15px, 1.3vw, 20px); font-weight: 700; line-height: 1.4; max-width: 18ch; }

  .crowd { display: grid; gap: 20px; }
  .crowd-head { display: flex; align-items: center; justify-content: space-between; }
  .crowd-head h2 { font-size: clamp(30px, 3.4vw, 56px); }
  .count { --lift: 4px; display: inline-flex; align-items: center; gap: 10px; padding: 8px 22px; border-radius: 999px; font-family: var(--display); font-size: clamp(28px, 3vw, 48px); }
  .empty { display: flex; align-items: center; gap: 14px; font-size: clamp(18px, 1.6vw, 26px); font-weight: 800; padding: 30px 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 30px 16px; padding-top: 12px; }
  .grid.wide { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  .footnote { display: flex; align-items: center; gap: 14px; font-size: clamp(16px, 1.4vw, 22px); font-weight: 800; margin-top: 10px; }

  /* --- preguntar / responder */
  .working { flex: 1; display: grid; gap: 28px; align-content: start; }
  .working-head { display: flex; align-items: center; gap: 24px; }
  .working-head h1 { font-size: clamp(32px, 4vw, 64px); line-height: 1.1; }
  .ready { font-size: clamp(26px, 2.6vw, 44px); }

  /* --- revelación */
  .reveal { flex: 1; display: grid; grid-template-rows: auto auto 1fr auto; gap: clamp(14px, 2vw, 28px); min-height: 0; }
  .reveal-head { display: flex; align-items: center; gap: 20px; }
  .big-chip { font-size: clamp(15px, 1.3vw, 22px); padding: 10px 18px; }
  .pips { display: flex; gap: 10px; }
  .pips span { width: 12px; height: 12px; border-radius: 999px; background: rgba(20,20,20,.28); transition: width var(--pop), background var(--pop); }
  .pips span.on { width: 40px; background: var(--ink); }

  .question { --lift: 6px; display: flex; align-items: center; gap: 24px; padding: clamp(18px, 2.4vw, 36px); border-radius: 30px; transition: padding var(--glide); }
  .question h1 { font-size: clamp(28px, 3.4vw, 60px); font-weight: 900; line-height: 1.15; transition: font-size var(--glide); }
  .question.alone { padding-block: clamp(30px, 5vw, 80px); }
  .question.alone h1 { font-size: clamp(34px, 4.6vw, 80px); }

  .answers { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 440px), 1fr)); gap: 20px 28px; align-content: start; overflow-y: auto; padding: 4px 8px 12px 2px; }
  .drumroll { display: flex; align-items: center; gap: 18px; font-size: clamp(22px, 2.4vw, 40px); }

  .controls { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .ctl { --lift: 4px; display: inline-flex; align-items: center; gap: 10px; height: 60px; padding: 0 24px; border-radius: 18px; font-size: 19px; font-weight: 900; }
  .ctl.main { background: var(--ink); color: var(--paper); box-shadow: 4px 4px 0 rgba(20,20,20,.3); }
  .ctl:disabled { opacity: .35; cursor: default; }
  .keys { font-size: 15px; font-weight: 700; margin-left: auto; }

  @media (max-width: 860px) {
    .lobby { grid-template-columns: 1fr; }
    .working-head { flex-direction: column; text-align: center; }
    .question { flex-direction: column; text-align: center; }
    .keys { display: none; }
  }
</style>
