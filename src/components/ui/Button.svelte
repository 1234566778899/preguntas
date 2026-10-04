<script lang="ts">
  import { haptic } from "../../lib/theme";
  import Icon, { type IconName } from "./Icon.svelte";

  interface Props {
    label: string;
    icon?: IconName;
    /** `primary` es la pegatina negra (PrimaryButton); `ghost`, la blanca (GhostButton). */
    variant?: "primary" | "ghost";
    enabled?: boolean;
    busy?: boolean;
    /** Segunda línea, más pequeña, como "Invita a tus amigos" en "Crear sala". */
    detail?: string;
    onclick: () => void;
  }

  let {
    label,
    icon,
    variant = "primary",
    enabled = true,
    busy = false,
    detail = "",
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

<!-- Apagado no es "medio transparente": es otra pieza, sin relleno ni sombra,
     con el texto todavía legible. Así nadie cree que el botón está roto. -->
<button
  class="btn sticker press {variant}"
  class:off={!enabled}
  class:tall={!!detail}
  onclick={press}
  aria-disabled={!enabled || busy}
  aria-busy={busy}
>
  {#if busy}
    <span class="spinner"></span>
  {:else}
    {#if icon}<Icon name={icon} size={detail ? 24 : 18} weight={3} />{/if}
    <span class="words">
      <span class="label">{label}</span>
      {#if detail}<span class="detail">{detail}</span>{/if}
    </span>
  {/if}
</button>

<style>
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 60px;
    border-radius: 18px;
    transition:
      transform var(--press),
      box-shadow var(--press),
      background var(--glide),
      color var(--glide);
  }
  .tall { height: 70px; border-radius: 20px; gap: 16px; }

  .words { display: grid; justify-items: center; line-height: 1.1; }

  .primary {
    background: var(--ink);
    color: var(--paper);
    box-shadow: var(--lift) var(--lift) 0 rgba(20, 20, 20, 0.3);
  }
  .primary .label { font-family: var(--display); font-size: 18px; }
  .primary.tall .label { font-size: 22px; }

  .ghost {
    height: 56px;
    background: var(--paper);
    color: var(--ink);
  }
  .ghost .label { font-size: 18px; font-weight: 900; }

  .detail { font-size: 14px; font-weight: 500; opacity: 0.85; margin-top: 2px; }

  .off {
    background: transparent;
    color: var(--text-2);
    border-color: rgba(20, 20, 20, 0.55);
    box-shadow: none;
    cursor: not-allowed;
  }
  .off:active { transform: none !important; }

  .spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--paper);
    animation: spin 700ms linear infinite;
  }
  .ghost .spinner { border-color: var(--divider); border-top-color: var(--ink); }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
