<script lang="ts">
  import type { Palette } from "../lib/theme";

  interface Props { palette: Palette }
  let { palette }: Props = $props();
</script>

<!--
  Tres manchas de color enormes y desenfocadas que se mueven muy despacio, para
  que la pantalla respire aunque nadie toque nada. Al cambiar de fase los colores
  se funden en vez de saltar: la transición va en el `background`, y el vaivén en
  una animación aparte, así no se pisan.
-->
<div class="bg" aria-hidden="true">
  <i class="blob a" style="background:{palette.top}"></i>
  <i class="blob b" style="background:{palette.mid}"></i>
  <i class="blob c" style="background:{palette.bottom}"></i>
  <div class="vignette"></div>
  <div class="grain"></div>
</div>

<style>
  .bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    background: var(--ink);
    pointer-events: none;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.55;
    filter: blur(90px);
    /* El color se funde despacio al cambiar de fase. */
    transition: background 900ms ease-in-out;
    will-change: transform;
  }

  .a {
    width: 125vw;
    height: 125vw;
    top: -45vw;
    left: -30vw;
    animation: drift-a 13s ease-in-out infinite alternate;
  }

  .b {
    width: 105vw;
    height: 105vw;
    top: 25vh;
    left: 10vw;
    animation: drift-b 17s ease-in-out infinite alternate;
  }

  .c {
    width: 115vw;
    height: 115vw;
    bottom: -40vw;
    right: -25vw;
    animation: drift-c 21s ease-in-out infinite alternate;
  }

  @keyframes drift-a {
    to { transform: translate(22vw, 14vh) scale(1.1); }
  }
  @keyframes drift-b {
    to { transform: translate(-24vw, -16vh) scale(0.92); }
  }
  @keyframes drift-c {
    to { transform: translate(16vw, -18vh) scale(1.08); }
  }

  /* Oscurece las esquinas para que el contenido del centro respire. */
  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 30%,
      rgba(11, 8, 19, 0.85) 100%
    );
  }

  /* Grano casi invisible: rompe el degradado perfecto y quita el aire de plantilla. */
  .grain {
    position: absolute;
    inset: -50%;
    opacity: 0.035;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
  }
</style>
