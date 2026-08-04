<script lang="ts">
  import { haptic } from "../../lib/theme";

  interface Props {
    label: string;
    icon?: string;
    variant?: "primary" | "ghost";
    enabled?: boolean;
    busy?: boolean;
    onclick: () => void;
  }

  let {
    label,
    icon = "",
    variant = "primary",
    enabled = true,
    busy = false,
    onclick,
  }: Props = $props();

  function press() {
    if (!enabled || busy) {
      haptic.failure();
      return;
    }
    haptic.press();
    onclick();
  }
</script>

<button class="btn {variant} press" class:off={!enabled} onclick={press} disabled={!enabled || busy}>
  {#if busy}
    <span class="spinner"></span>
  {:else}
    {#if icon}<span class="ico">{icon}</span>{/if}
    <span>{label}</span>
  {/if}
</button>

<style>
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 58px;
    border-radius: 999px;
    font-size: 19px;
    font-weight: 800;
    transition:
      opacity var(--glide),
      transform 260ms cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  .primary {
    background: linear-gradient(135deg, #fff, #e9e4ff);
    color: var(--ink);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.18);
  }

  .ghost {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--stroke);
    color: var(--text);
    height: 52px;
    font-size: 17px;
    font-weight: 700;
  }

  .off {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .ico {
    font-size: 15px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2.5px solid rgba(11, 8, 19, 0.25);
    border-top-color: var(--ink);
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
