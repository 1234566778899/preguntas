<script lang="ts">
  import { haptic } from "../../lib/theme";
  import Icon from "./Icon.svelte";

  interface Props {
    /** Duración total en segundos. */
    seconds: number;
    /** Cuándo empezó a contar (ms). */
    startedAt: number;
    /** Más grande, para la pantalla grande. */
    big?: boolean;
  }

  let { seconds, startedAt, big = false }: Props = $props();

  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 250);
    return () => clearInterval(id);
  });

  let left = $derived(Math.max(0, Math.ceil(seconds - (now - startedAt) / 1000)));
  let fraction = $derived(seconds > 0 ? left / seconds : 0);
  let hurry = $derived(left > 0 && left <= 10);

  // Los últimos cinco segundos se notan en la mano, como el tictac de Kahoot.
  let lastTick = -1;
  $effect(() => {
    if (left !== lastTick && left > 0 && left <= 5) haptic.tap();
    lastTick = left;
  });
</script>

<!-- Solo empuja: al llegar a cero nadie pierde lo que escribió. Lo que cambia
     es que se ve, y el grupo sabe que alguien se está atascando. -->
<div class="countdown" class:big class:hurry class:over={left === 0} role="timer" aria-live="off"
  aria-label={left === 0 ? "Se acabó el tiempo" : `Quedan ${left} segundos`}>
  <span class="pill sticker">
    <Icon name="clock" size={big ? 30 : 16} weight={3} />
    <span class="num">{left === 0 ? "¡Tiempo!" : `${left}`}</span>
  </span>
  <span class="rail"><i style="width:{fraction * 100}%"></i></span>
</div>

<style>
  .countdown { display: flex; align-items: center; gap: 10px; width: 100%; }

  .pill {
    --lift: 3px;
    display: inline-flex; align-items: center; gap: 6px; flex: none;
    min-width: 72px; justify-content: center;
    padding: 6px 12px; border-radius: 999px;
    font-family: var(--display); font-size: 17px;
    transition: background var(--pop);
  }
  .num { font-variant-numeric: tabular-nums; }

  .rail { flex: 1; height: 20px; }
  .rail > i { transition: width 300ms linear; }

  .hurry .pill { background: var(--pop-color); animation: beat 1s ease-in-out infinite; }
  .over .pill { background: var(--ink); color: var(--paper); }

  .big { gap: 18px; }
  .big .pill { --lift: 5px; min-width: 150px; padding: 12px 22px; font-size: 40px; gap: 12px; }
  .big .rail { height: 34px; padding: 4px; border-width: 3px; }

  @keyframes beat {
    50% { transform: scale(1.08); }
  }
</style>
