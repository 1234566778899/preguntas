<script lang="ts">
  import type { Game } from "../../lib/game.svelte";

  interface Props { game: Game; path: string }
  let { game, path }: Props = $props();

  let url = $state<string | null>(null);
  let failed = $state(false);

  // El bucket es privado: la ruta por sí sola no enseña nada, hay que pedir una
  // URL firmada. El motor las guarda, así que pasar de pregunta y volver no
  // dispara otra petición.
  $effect(() => {
    const wanted = path;
    let cancelled = false;
    failed = false;

    game.imageUrl(wanted).then((signed) => {
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
  <p class="muted">No se pudo cargar la foto.</p>
{:else}
  <div class="skeleton" aria-hidden="true"></div>
{/if}

<style>
  img {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: cover;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .skeleton {
    height: 120px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.08);
    animation: pulse 1.4s ease-in-out infinite;
  }

  p {
    font-size: 13px;
  }

  @keyframes pulse {
    50% { opacity: 0.45; }
  }
</style>
