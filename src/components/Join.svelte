<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import { haptic } from "../lib/theme";

  interface Props { game: Game }
  let { game }: Props = $props();

  const LENGTH = 5;
  let code = $state("");
  let input = $state<HTMLInputElement | null>(null);

  $effect(() => { input?.focus(); });

  function onInput(e: Event & { currentTarget: HTMLInputElement }) {
    const clean = e.currentTarget.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, LENGTH);
    if (clean.length > code.length) haptic.tap();
    code = clean;
    e.currentTarget.value = clean;
    if (clean.length === LENGTH) { haptic.press(); input?.blur(); }
  }
</script>

<section class="screen">
  <header>
    <button class="round press" aria-label="Volver" onclick={() => (game.route = "home")}>‹</button>
  </header>

  <div class="middle">
    <div in:fly={{ y: 22, duration: 420 }}>
      <h1>El código de la sala</h1>
      <p class="dim">Pídeselo a quien creó la partida</p>
    </div>

    <!-- Los recuadros son el disfraz; el campo real es invisible. -->
    <button class="boxes" onclick={() => input?.focus()} in:fly={{ y: 22, duration: 420, delay: 60 }}>
      {#each Array(LENGTH) as _, i}
        <span class="box card" class:cursor={i === code.length}>{code[i] ?? ""}</span>
      {/each}
    </button>

    <input
      bind:this={input}
      class="hidden"
      inputmode="latin"
      autocapitalize="characters"
      autocomplete="off"
      spellcheck="false"
      oninput={onInput}
    />
  </div>

  <footer in:fly={{ y: 22, duration: 420, delay: 120 }}>
    <Button label="Entrar" icon="→" enabled={code.length === LENGTH && !game.isBusy}
      busy={game.isBusy} onclick={() => game.joinRoom(code)} />
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  header { padding: 8px 20px; }
  .round { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.08); border: 1px solid var(--stroke); font-size: 20px; }
  .middle { flex: 1; display: grid; align-content: center; justify-items: center; gap: 28px; text-align: center; padding: 0 24px; }
  h1 { font-size: 28px; font-weight: 900; }
  .middle p { font-size: 14px; margin-top: 8px; }
  .boxes { display: flex; gap: 10px; }
  .box {
    width: 54px; height: 68px; border-radius: 18px; display: grid; place-items: center;
    font-size: 30px; font-weight: 900; transition: box-shadow var(--pop), transform var(--pop);
  }
  .box.cursor { box-shadow: 0 0 0 2px rgba(255,255,255,.9); transform: scale(1.04); }
  .hidden { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
  footer { padding: 24px; }
</style>
