<script lang="ts">
  import { appStoreUrl, playStoreUrl } from "../../lib/links";

  interface Props { compact?: boolean }
  let { compact = false }: Props = $props();
</script>

<!-- La app y la web comparten salas, así que las tiendas son un extra, no un
     muro: se puede jugar sin instalar nada. -->
<div class="stores" class:compact>
  <a class="store sticker press" href={appStoreUrl} target="_blank" rel="noopener">
    <svg viewBox="0 0 384 512" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
    <span class="words"><small>Descárgala en el</small><b>App Store</b></span>
  </a>
  <a class="store sticker press" href={playStoreUrl} target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M4.2 2.6c-.3.3-.5.8-.5 1.4v16c0 .6.2 1.1.5 1.4l9.1-9.4z"/>
      <path d="M16.4 15.2l-3.1-3.2-9.1 9.4c.4.4 1.1.4 1.8 0z"/>
      <path d="M16.4 8.8L6 2.6c-.7-.4-1.4-.4-1.8 0l9.1 9.4z"/>
      <path d="M20.2 11l-3.8-2.2-3.1 3.2 3.1 3.2 3.8-2.2c1.1-.6 1.1-1.4 0-2z"/>
    </svg>
    <span class="words"><small>Disponible en</small><b>Google Play</b></span>
  </a>
</div>

<style>
  .stores { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }

  .store {
    --lift: 3px;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    min-height: 50px; padding: 6px 10px; border-radius: 14px;
    background: var(--ink); color: var(--paper); text-decoration: none;
    box-shadow: var(--lift) var(--lift) 0 rgba(20, 20, 20, 0.3);
  }
  .words { display: grid; line-height: 1.05; text-align: left; }
  small { font-size: 10px; font-weight: 600; opacity: 0.85; }
  b { font-size: 15px; font-weight: 900; }

  .compact .store { min-height: 44px; }
  .compact b { font-size: 14px; }
</style>
