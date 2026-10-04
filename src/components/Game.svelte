<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { Game } from "../lib/game.svelte";
  import { Screen } from "../lib/screen.svelte";
  import { paletteFor, palettes } from "../lib/theme";
  import AnimatedBackground from "./AnimatedBackground.svelte";
  import Confetti from "./Confetti.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import Terms from "./Terms.svelte";
  import HowTo from "./HowTo.svelte";
  import Home from "./Home.svelte";
  import Join from "./Join.svelte";
  import Lobby from "./Lobby.svelte";
  import Asking from "./Asking.svelte";
  import Answering from "./Answering.svelte";
  import Reveal from "./Reveal.svelte";
  import ScreenView from "./ScreenView.svelte";

  const game = new Game();
  const tv = new Screen();
  let showingTerms = $state(false);
  let showingHowTo = $state(false);

  /** Identidad de la pantalla visible: cuando cambia, se hace la transición. */
  let screen = $derived.by(() => {
    if (!game.isConfigured) return "setup";
    // La pantalla grande no juega, así que no pasa por las normas: quien la
    // pone ya las aceptó en su móvil.
    if (game.route === "screen") return "screen";
    if (!game.hasAcceptedTerms) return "terms";
    if (showingTerms) return "terms-again";
    if (game.route === "home") return "home";
    if (game.route === "join") return "join";
    return `game-${game.phase}`;
  });

  let palette = $derived(
    game.route === "screen"
      ? tv.room ? paletteFor(tv.phase) : palettes.lobby
      : game.palette,
  );

  // El aviso visible: del juego o de la pantalla grande, según dónde se esté.
  let banner = $derived(game.route === "screen" ? tv.banner : game.banner);

  function dismissBanner() {
    game.banner = null;
    tv.banner = null;
  }

  // Fuera de `$effect`: `restoreSession` toca estado del juego (`room`, `busy`)
  // que el propio efecto acabaría observando, y se reejecutaría en bucle.
  onMount(() => { void game.restoreSession(); });

  $effect(() => {
    // Al volver de otra pestaña puede haberse perdido algún evento.
    const wake = () => {
      if (document.visibilityState !== "visible") return;
      if (game.route === "screen") void tv.refresh();
      else void game.resume();
    };
    document.addEventListener("visibilitychange", wake);
    return () => document.removeEventListener("visibilitychange", wake);
  });

  // Los errores no abren diálogos: bajan desde arriba y se van solos.
  // Un modal a mitad de partida corta el ritmo del juego.
  $effect(() => {
    if (!banner) return;
    const id = setTimeout(dismissBanner, 3400);
    return () => clearTimeout(id);
  });
</script>

<AnimatedBackground {palette} />

<main class:wide={screen === "screen"}>
  {#key screen}
    <div
      class="layer"
      in:fly={{ y: 44, duration: 300, delay: 90, opacity: 0 }}
      out:fly={{ y: 0, duration: 140, opacity: 0 }}
    >
      {#if screen === "setup"}
        <div class="setup">
          <h1 class="title">Falta conectar Supabase</h1>
          <p class="dim">
            Copia <code>.env.example</code> a <code>.env</code> y pon la URL del proyecto y la
            clave publishable. Las mismas que en <code>Anonimas/Config/Secrets.swift</code>, para
            que el móvil y la web compartan salas.
          </p>
        </div>
      {:else if screen === "terms"}
        <Terms onaccept={() => game.acceptTerms()} />
      {:else if screen === "terms-again"}
        <Terms onclose={() => (showingTerms = false)} />
      {:else if screen === "home"}
        <Home {game} onterms={() => (showingTerms = true)} onhowto={() => (showingHowTo = true)} />
      {:else if screen === "join"}
        <Join {game} />
      {:else if screen === "screen"}
        <ScreenView screen={tv} initialCode={game.pendingCode} onexit={() => { game.pendingCode = ""; game.route = "home"; }} />
      {:else if screen === "game-lobby"}
        <Lobby {game} />
      {:else if screen === "game-asking"}
        <Asking {game} />
      {:else if screen === "game-answering"}
        <Answering {game} />
      {:else if screen === "game-reveal"}
        <Reveal {game} />
      {/if}
    </div>
  {/key}
</main>

{#if showingHowTo}
  <HowTo onclose={() => (showingHowTo = false)} />
{/if}

<Confetti trigger={game.route === "screen" ? tv.confettiTrigger : game.confettiTrigger} />

{#if banner}
  <div class="banner sticker" role="status" transition:fly={{ y: -30, duration: 320 }}
    onclick={dismissBanner}>
    <Mascot pose="ups" size={44} />
    <p>{banner}</p>
  </div>
{/if}

<style>
  main {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 460px;
    height: 100dvh;
    max-height: 100dvh;
  }

  /* La pantalla grande usa todo el ancho: es para una tele. */
  main.wide { max-width: none; }

  .layer {
    position: absolute;
    inset: 0;
  }

  .setup {
    height: 100%;
    display: grid;
    align-content: center;
    gap: 14px;
    padding: 32px;
  }
  .setup p { font-size: 15px; line-height: 1.5; }
  code {
    font-family: var(--mono);
    font-size: 13px;
    background: var(--paper);
    border: 1.5px solid var(--ink);
    padding: 1px 6px;
    border-radius: 6px;
  }

  .banner {
    --lift: 3px;
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    width: min(420px, calc(100vw - 32px));
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 18px;
    cursor: pointer;
  }
  .banner p { font-size: 15px; font-weight: 800; }
</style>
