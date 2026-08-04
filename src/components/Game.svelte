<script lang="ts">
  import { fly } from "svelte/transition";
  import { Game } from "../lib/game.svelte";
  import { supportEmail } from "../lib/supabase";
  import AnimatedBackground from "./AnimatedBackground.svelte";
  import Confetti from "./Confetti.svelte";
  import Terms from "./Terms.svelte";
  import Home from "./Home.svelte";
  import Join from "./Join.svelte";
  import Lobby from "./Lobby.svelte";
  import Asking from "./Asking.svelte";
  import Answering from "./Answering.svelte";
  import Reveal from "./Reveal.svelte";

  const game = new Game();
  let showingTerms = $state(false);

  /** Identidad de la pantalla visible: cuando cambia, se hace la transición. */
  let screen = $derived.by(() => {
    if (!game.isConfigured) return "setup";
    if (!game.hasAcceptedTerms) return "terms";
    if (showingTerms) return "terms-again";
    if (game.route === "home") return "home";
    if (game.route === "join") return "join";
    return `game-${game.phase}`;
  });

  $effect(() => {
    void game.restoreSession();

    // Al volver de otra pestaña puede haberse perdido algún evento.
    const wake = () => {
      if (document.visibilityState === "visible") void game.resume();
    };
    document.addEventListener("visibilitychange", wake);
    return () => document.removeEventListener("visibilitychange", wake);
  });

  // Los errores no abren diálogos: bajan desde arriba y se van solos.
  // Un modal a mitad de partida corta el ritmo del juego.
  $effect(() => {
    if (!game.banner) return;
    const id = setTimeout(() => (game.banner = null), 3400);
    return () => clearTimeout(id);
  });
</script>

<AnimatedBackground palette={game.palette} />

<main>
  {#key screen}
    <div
      class="layer"
      in:fly={{ y: 26, duration: 450, opacity: 0 }}
      out:fly={{ y: -14, duration: 250, opacity: 0 }}
    >
      {#if screen === "setup"}
        <div class="setup">
          <h1>Falta conectar Supabase</h1>
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
        <Home {game} onterms={() => (showingTerms = true)} />
      {:else if screen === "join"}
        <Join {game} />
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

<Confetti trigger={game.confettiTrigger} />

{#if game.banner}
  <div class="banner card" role="status" transition:fly={{ y: -30, duration: 320 }}
    onclick={() => (game.banner = null)}>
    <span>⚠</span>
    <p>{game.banner}</p>
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
  .setup h1 { font-size: 28px; font-weight: 900; }
  .setup p { font-size: 15px; line-height: 1.5; }
  code {
    font-family: ui-monospace, monospace;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 6px;
  }

  .banner {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    width: min(420px, calc(100vw - 32px));
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 20px;
    cursor: pointer;
  }
  .banner span { color: #ffc857; }
  .banner p { font-size: 14px; font-weight: 700; }
</style>
