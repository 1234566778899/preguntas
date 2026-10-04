<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import CodeInput from "./ui/CodeInput.svelte";
  import Icon from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";

  interface Props { game: Game }
  let { game }: Props = $props();

  // Si se llegó con un enlace de invitación, el código ya viene puesto.
  let code = $state(game.pendingCode);
  $effect(() => { game.pendingCode = ""; });
</script>

<section class="screen">
  <header>
    <button class="round sticker press" aria-label="Volver" onclick={() => (game.route = "home")}>
      <Icon name="arrow-left" size={18} weight={3} />
    </button>
  </header>

  <div class="middle">
    <div class="copy" in:fly={{ y: 22, duration: 420 }}>
      <Mascot pose="sorprendida" size={96} />
      <h1 class="title">El código de la sala</h1>
      <p class="dim">Pídeselo a quien creó la partida</p>
    </div>

    <div in:fly={{ y: 22, duration: 420, delay: 60 }}>
      <CodeInput bind:code onsubmit={() => game.joinRoom(code)} />
    </div>
  </div>

  <footer in:fly={{ y: 22, duration: 420, delay: 120 }}>
    <Button label="Entrar" icon="arrow-right" enabled={code.length === 5 && !game.isBusy}
      busy={game.isBusy} onclick={() => game.joinRoom(code)} />
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  header { padding: 8px 20px; }
  .round { --lift: 3px; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; }
  .middle { flex: 1; display: grid; align-content: center; justify-items: center; gap: 28px; text-align: center; padding: 0 24px; }
  .copy { display: grid; justify-items: center; gap: 8px; }
  .copy p { font-size: 16px; }
  footer { padding: 24px 22px; }
</style>
