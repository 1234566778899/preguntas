<!-- Tres puntos que rebotan en cadena: comunica "esto sigue vivo, falta gente". -->
<div class="dots">
  {#each [0, 1, 2] as i}
    <i style="animation-delay:{i * 0.14}s"></i>
  {/each}
</div>

<style>
  .dots {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--text-2);
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(1.5px);
    }
    50% {
      transform: translateY(-5px);
    }
  }
</style>
