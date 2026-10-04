<script lang="ts">
  import { haptic } from "../../lib/theme";

  interface Props {
    code: string;
    onsubmit?: () => void;
    /** Recuadros más grandes, para la pantalla grande. */
    big?: boolean;
  }

  let { code = $bindable(""), onsubmit, big = false }: Props = $props();

  const LENGTH = 5;
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

<!-- Los recuadros son el disfraz; el campo real es invisible. -->
<button class="boxes" class:big onclick={() => input?.focus()} type="button" aria-label="Escribir el código">
  {#each Array(LENGTH) as _, i}
    <span class="box sticker" class:cursor={i === code.length} class:filled={!!code[i]}>{code[i] ?? ""}</span>
  {/each}
</button>

<input
  bind:this={input}
  class="hidden"
  inputmode="latin"
  autocapitalize="characters"
  autocomplete="off"
  spellcheck="false"
  aria-label="Código de la sala"
  value={code}
  oninput={onInput}
  onkeydown={(e) => e.key === "Enter" && code.length === LENGTH && onsubmit?.()}
/>

<style>
  .boxes { display: flex; gap: 10px; }
  .box {
    --lift: 3px;
    width: 54px; height: 68px; border-radius: 14px; display: grid; place-items: center;
    font-family: var(--display); font-size: 30px;
    transition: transform var(--pop), background var(--pop);
  }
  .box.filled { background: var(--pop-color); }
  .box.cursor { transform: translateY(-4px); box-shadow: 4px 8px 0 var(--ink); }

  .big { gap: 18px; }
  .big .box { --lift: 6px; width: 100px; height: 124px; border-radius: 22px; font-size: 60px; }

  .hidden { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
</style>
