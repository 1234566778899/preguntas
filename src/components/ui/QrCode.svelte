<script lang="ts">
  import QRCode from "qrcode";

  interface Props { text: string; size?: number }
  let { text, size = 220 }: Props = $props();

  let svg = $state("");

  // SVG y no canvas: se ve nítido en una tele 4K sin calcular tamaños.
  $effect(() => {
    const wanted = text;
    let cancelled = false;
    QRCode.toString(wanted, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#141414", light: "#ffffff" },
    }).then((out) => { if (!cancelled) svg = out; });
    return () => { cancelled = true; };
  });
</script>

<div class="qr sticker" style="--s:{size}px" role="img" aria-label="Código QR para entrar a la sala">
  {@html svg}
</div>

<style>
  .qr { width: var(--s); height: var(--s); padding: 10px; border-radius: 20px; }
  .qr :global(svg) { display: block; width: 100%; height: 100%; }
</style>
