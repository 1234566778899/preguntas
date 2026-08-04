<script lang="ts">
  import type { Game } from "../../lib/game.svelte";
  import type { ReportKind } from "../../lib/types";
  import { haptic } from "../../lib/theme";

  interface Props {
    game: Game;
    kind: ReportKind;
    targetId: string;
  }

  let { game, kind, targetId }: Props = $props();

  let open = $state(false);
  let sent = $state(false);

  const reasons = [
    "Acoso o insultos",
    "Odio o violencia",
    "Contenido sexual",
    "Afecta a un menor",
    "Spam",
    "Otro motivo",
  ];

  function choose(reason: string) {
    open = false;
    sent = true;
    game.report(kind, targetId, reason);
  }
</script>

<!-- Deliberadamente discreta: tiene que estar siempre a mano, pero si pesa
     visualmente convierte un juego entre amigos en un panel de moderación. -->
<button
  class="flag press"
  class:sent
  aria-label={sent ? "Denunciado" : "Denunciar"}
  onclick={() => {
    if (sent) return;
    haptic.tap();
    open = true;
  }}
>
  {sent ? "✓" : "⚑"}
</button>

{#if open}
  <div
    class="sheet"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={() => (open = false)}
    onkeydown={(e) => e.key === "Escape" && (open = false)}
  >
    <div class="panel card" role="document" onclick={(e) => e.stopPropagation()}>
      <h3>Denunciar contenido</h3>
      <p class="dim">Nos llega una copia para revisarla. El resto del grupo no se entera.</p>
      {#each reasons as reason}
        <button class="reason press" onclick={() => choose(reason)}>{reason}</button>
      {/each}
      <button class="cancel press" onclick={() => (open = false)}>Cancelar</button>
    </div>
  </div>
{/if}

<style>
  .flag {
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 8px;
    font-size: 13px;
    color: var(--text-3);
    transition: color var(--pop);
  }

  .flag.sent {
    color: #4ade80;
    cursor: default;
  }

  .sheet {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: end center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    animation: fade 200ms ease;
  }

  .panel {
    width: 100%;
    max-width: 420px;
    padding: 24px;
    display: grid;
    gap: 8px;
    max-height: 80vh;
    overflow-y: auto;
    animation: rise 320ms cubic-bezier(0.34, 1.36, 0.64, 1);
  }

  h3 {
    font-size: 19px;
  }

  p {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .reason,
  .cancel {
    height: 48px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    font-weight: 700;
    text-align: center;
  }

  .cancel {
    margin-top: 6px;
    background: transparent;
    color: var(--text-2);
  }

  @keyframes fade {
    from { opacity: 0; }
  }

  @keyframes rise {
    from { transform: translateY(30px); opacity: 0; }
  }
</style>
