<script lang="ts">
  import type { Game } from "../../lib/game.svelte";
  import { haptic } from "../../lib/theme";

  interface Props { game: Game; title?: string }
  let { game, title = "" }: Props = $props();

  let confirming = $state(false);
</script>

<header>
  <button
    class="round press"
    aria-label="Salir de la sala"
    onclick={() => { haptic.tap(); confirming = true; }}
  >⎋</button>

  {#if title}<span class="chip">{title}</span>{/if}

  <span class="spacer"></span>
</header>

{#if confirming}
  <div class="sheet" role="dialog" aria-modal="true">
    <div class="panel card">
      <h3>¿Salir de la sala?</h3>
      <p class="dim">Perderás esta partida.</p>
      <button class="danger press" onclick={() => { confirming = false; game.leave(); }}>Salir</button>
      <button class="cancel press" onclick={() => (confirming = false)}>Quedarme</button>
    </div>
  </div>
{/if}

<style>
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px 12px;
  }

  .round {
    width: 44px;
    height: 44px;
    flex: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--stroke);
    font-size: 17px;
  }

  .chip {
    margin: 0 auto;
    text-transform: uppercase;
  }

  .spacer {
    width: 44px;
    flex: none;
  }

  .sheet {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: end center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    animation: fade 200ms ease;
  }

  .panel {
    width: 100%;
    max-width: 420px;
    padding: 24px;
    display: grid;
    gap: 10px;
    animation: rise 320ms cubic-bezier(0.34, 1.36, 0.64, 1);
  }

  h3 {
    font-size: 20px;
  }

  p {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .danger,
  .cancel {
    height: 50px;
    border-radius: 999px;
    font-weight: 800;
  }

  .danger {
    background: #f43f5e;
    color: #fff;
  }

  .cancel {
    background: rgba(255, 255, 255, 0.1);
  }

  @keyframes fade {
    from { opacity: 0; }
  }

  @keyframes rise {
    from { transform: translateY(30px); opacity: 0; }
  }
</style>
