<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Countdown from "./ui/Countdown.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import PlayerTile from "./PlayerTile.svelte";

  interface Props { game: Game; title: string; subtitle: string; seconds: number }
  let { game, title, subtitle, seconds }: Props = $props();

  let progress = $derived(
    game.players.length ? game.readyCount / game.players.length : 0,
  );
</script>

<!-- Sale dos veces por partida (tras enviar la pregunta y tras las respuestas),
     así que vive aquí una sola vez en lugar de repetirse en las dos fases. -->
<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="stage">
    <div class="radar" aria-hidden="true">
      {#each [0, 1, 2] as i}
        <i style="animation-delay:{i * 0.85}s"></i>
      {/each}
      <Mascot pose="esperando" size={150} idle />
    </div>

    <div class="copy">
      <h1 class="title">{title}</h1>
      <p class="dim">{subtitle}</p>
    </div>
  </div>

  <div class="panel sticker">
    <Countdown {seconds} startedAt={game.phaseStartedAt} />
    <p class="count">{game.readyCount} de {game.players.length} listos</p>
    <div class="rail"><i style="width:{progress * 100}%"></i></div>
    <div class="grid">
      {#each game.players as player, i (player.id)}
        <div in:fly={{ y: 16, duration: 400, delay: i * 45 }}>
          <PlayerTile {player} me={player.id === game.me?.id} done={game.hasFinished(player)} />
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .stage { flex: 1; display: grid; align-content: center; gap: 8px; }

  .radar { position: relative; height: 180px; display: grid; place-items: center; }
  .radar i {
    position: absolute; width: 130px; height: 130px; border-radius: 50%;
    border: var(--stroke) solid var(--ink);
    animation: ping 2.6s ease-out infinite;
  }
  @keyframes ping {
    from { transform: scale(.85); opacity: .5; }
    to { transform: scale(1.9); opacity: 0; }
  }

  .copy { text-align: center; padding: 0 32px; }
  .copy p { font-size: 16px; margin-top: 10px; line-height: 1.4; }

  .panel { margin: 12px 20px 22px; padding: 20px; display: grid; gap: 14px; border-radius: 26px; }
  .count { font-size: 16px; font-weight: 900; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px 10px; margin-top: 4px; }
</style>
