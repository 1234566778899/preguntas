<script lang="ts">
  interface Props { path: string; imageUrl: (path: string) => Promise<string | null> }
  let { path, imageUrl }: Props = $props();

  let url = $state<string | null>(null);
  let failed = $state(false);

  // El bucket es privado: la ruta por sí sola no enseña nada, hay que pedir una
  // URL firmada. El motor las guarda, así que pasar de pregunta y volver no
  // dispara otra petición.
  $effect(() => {
    const wanted = path;
    let cancelled = false;
    failed = false;

    imageUrl(wanted).then((signed) => {
      if (cancelled) return;
      if (signed) url = signed;
      else failed = true;
    });

    return () => { cancelled = true; };
  });
</script>

{#if url}
  <img src={url} alt="Foto de una respuesta anónima" loading="lazy" />
{:else if failed}
  <p class="dim">No se pudo cargar la foto.</p>
{:else}
  <div class="skeleton" aria-hidden="true"></div>
{/if}

<style>
  img {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid var(--ink);
  }

  .skeleton {
    height: 120px;
    border-radius: 12px;
    background: rgba(20, 20, 20, 0.1);
    animation: pulse 1.4s ease-in-out infinite;
  }

  p { font-size: 13px; }

  @keyframes pulse {
    50% { opacity: 0.45; }
  }
</style>
