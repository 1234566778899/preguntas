<script lang="ts">
  /**
   * La mascota de Anónimas, la misma de la app (Design/Mascot.swift): aparece
   * en los ratos muertos para que no parezcan una pantalla de carga.
   */
  type Pose = "hola" | "esperando" | "pensando" | "celebrando" | "sorprendida" | "ups";

  interface Props {
    pose: Pose;
    size?: number;
    /** Balanceo en bucle, solo donde la pantalla está esperando algo. */
    idle?: boolean;
  }

  let { pose, size = 120, idle = false }: Props = $props();
</script>

<span class="mascot" style="--s:{size}px" aria-hidden="true">
  <img class:idle src="/mascota/{pose}.webp" alt="" width={size} height={size} draggable="false" />
</span>

<style>
  .mascot {
    display: inline-block;
    width: var(--s);
    height: var(--s);
    flex: none;
    animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
    transform-origin: bottom center;
  }
  img { width: 100%; height: 100%; display: block; transform-origin: bottom center; }
  .idle { animation: bob 1.1s ease-in-out infinite alternate; }

  @keyframes pop {
    from { transform: scale(0.6); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes bob {
    from { transform: rotate(-4deg); }
    to { transform: rotate(4deg) translateY(calc(var(--s) * -0.04)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .mascot, .idle { animation: none; }
  }
</style>
