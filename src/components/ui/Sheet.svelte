<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props { onclose: () => void; children: Snippet }
  let { onclose, children }: Props = $props();
</script>

<!-- Hoja que sube desde abajo, como las `.sheet` de la app. Se cierra tocando
     fuera o con Escape; dentro, los toques no la cierran. -->
<div
  class="scrim"
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  onclick={onclose}
  onkeydown={(e) => e.key === "Escape" && onclose()}
>
  <div class="panel sticker" role="document" onclick={(e) => e.stopPropagation()}>
    {@render children()}
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: end center;
    padding: 20px;
    background: rgba(20, 20, 20, 0.45);
    animation: fade 200ms ease;
  }

  .panel {
    width: 100%;
    max-width: 420px;
    max-height: 82vh;
    overflow-y: auto;
    padding: 24px;
    display: grid;
    gap: 10px;
    border-radius: 26px;
    animation: rise 320ms cubic-bezier(0.34, 1.36, 0.64, 1);
  }

  @keyframes fade {
    from { opacity: 0; }
  }
  @keyframes rise {
    from { transform: translateY(40px); opacity: 0; }
  }
</style>
