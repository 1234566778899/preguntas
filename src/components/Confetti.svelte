<script lang="ts">
  interface Props { trigger: number }
  let { trigger }: Props = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);

  const LIFETIME = 4.2;
  const COLORS = ["#FFC857", "#FF5C8A", "#7C5CFF", "#22D3A7", "#38BDF8", "#FFFFFF"];

  interface Piece {
    x: number; delay: number; speed: number; sway: number;
    swayWidth: number; phase: number; spin: number;
    w: number; h: number; color: string;
  }

  function makePiece(): Piece {
    const side = 6 + Math.random() * 5;
    return {
      x: -0.05 + Math.random() * 1.1,
      delay: Math.random() * 0.9,
      speed: 0.75 + Math.random() * 0.7,
      sway: 1.6 + Math.random() * 1.8,
      swayWidth: 10 + Math.random() * 32,
      phase: Math.random() * Math.PI * 2,
      spin: (2.5 + Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1),
      w: side,
      h: side * (1.2 + Math.random() * 0.9),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  // Dibujado en canvas: cientos de trozos sin crear cientos de elementos.
  $effect(() => {
    if (trigger === 0 || !canvas) return;

    const el = canvas;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const pieces = Array.from({ length: 110 }, makePiece);
    const started = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const elapsed = (now - started) / 1000;
      const w = el.width;
      const h = el.height;
      ctx.clearRect(0, 0, w, h);

      if (elapsed >= LIFETIME) {
        window.removeEventListener("resize", resize);
        return;
      }

      const fade = Math.min(1, Math.max(0, (LIFETIME - elapsed) / 1.1));

      for (const p of pieces) {
        const t = elapsed - p.delay;
        if (t <= 0) continue;

        const x = p.x * w + Math.sin(t * p.sway + p.phase) * p.swayWidth * dpr;
        const y = -40 * dpr + t * p.speed * h * 0.34;
        if (y > h + 40 * dpr) continue;

        const spin = t * p.spin;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(spin);
        // Achatar según el giro simula que el papel se voltea.
        ctx.scale(1, Math.abs(Math.cos(spin)) * 0.9 + 0.1);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.fillRect((-p.w / 2) * dpr, (-p.h / 2) * dpr, p.w * dpr, p.h * dpr);
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, el.width, el.height);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 30;
    pointer-events: none;
  }
</style>
