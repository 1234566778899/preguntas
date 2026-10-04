<script lang="ts">
  import type { Palette } from "../lib/theme";

  interface Props { palette: Palette }
  let { palette }: Props = $props();

  // Igual que AnimatedBackground.swift: el fondo es un color plano y quieto. Lo
  // único que se mueve es el cambio de fase, un círculo del color nuevo que
  // crece desde abajo y tapa la pantalla. Se ve aunque nadie mire el texto.
  let under = $state(palette.background);
  let over = $state(palette.background);
  let wipe = $state(0);

  $effect(() => {
    const next = palette.background;
    if (next === over) return;
    // Si llega otra fase a mitad de barrido, se parte del color que iba entrando.
    under = over;
    over = next;
    wipe += 1;
  });

  // El color de la fase también pinta la barra del navegador en el móvil y los
  // márgenes que quedan fuera de la columna del juego en escritorio.
  $effect(() => {
    const root = document.documentElement;
    root.style.setProperty("--phase", palette.background);
    root.style.setProperty("--pop-color", palette.pop);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.background);
  });

  function done() {
    under = over;
  }
</script>

<div class="bg" aria-hidden="true" style="background:{under}">
  {#key wipe}
    {#if wipe > 0}
      <i class="sweep" style="background:{over}" onanimationend={done}></i>
    {/if}
  {/key}
</div>

<style>
  .bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  /* Centrado en el borde de abajo y con radio hasta la esquina más lejana:
     al crecer del todo cubre la pantalla entera. */
  .sweep {
    position: absolute;
    left: 50%;
    top: 100%;
    width: 300vmax;
    height: 300vmax;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: sweep 520ms ease-in-out forwards;
  }

  @keyframes sweep {
    to { transform: translate(-50%, -50%) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .sweep { animation: none; transform: translate(-50%, -50%) scale(1); }
  }
</style>
