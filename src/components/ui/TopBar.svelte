<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Game } from "../../lib/game.svelte";
  import { haptic } from "../../lib/theme";
  import Icon from "./Icon.svelte";
  import Sheet from "./Sheet.svelte";

  interface Props { game: Game; title?: string; trailing?: Snippet }
  let { game, title = "", trailing }: Props = $props();

  let confirming = $state(false);
</script>

<header>
  <button
    class="round sticker press"
    aria-label="Salir de la sala"
    onclick={() => { haptic.tap(); confirming = true; }}
  ><Icon name="x" size={18} weight={3} /></button>

  {#if title}<span class="chip upper">{title}</span>{/if}

  <!-- Hueco simétrico al botón de salir, para que el título quede centrado. -->
  <span class="side">{@render trailing?.()}</span>
</header>

{#if confirming}
  <Sheet onclose={() => (confirming = false)}>
    <h3 class="title">¿Salir de la sala?</h3>
    <p class="dim">Perderás esta partida.</p>
    <button class="danger sticker press" onclick={() => { confirming = false; game.leave(); }}>Salir</button>
    <button class="cancel sticker press" onclick={() => (confirming = false)}>Quedarme</button>
  </Sheet>
{/if}

<style>
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px 12px;
  }

  .round {
    --lift: 3px;
    width: 46px;
    height: 46px;
    flex: none;
    border-radius: 50%;
    display: grid;
    place-items: center;
  }

  .upper { margin: 0 auto; text-transform: uppercase; }

  .side { width: 46px; flex: none; display: flex; justify-content: flex-end; }

  h3 { font-size: 24px; }
  p { font-size: 15px; margin-bottom: 8px; }

  .danger,
  .cancel {
    height: 54px;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 900;
  }
  .danger { background: var(--warning); color: var(--paper); }
</style>
