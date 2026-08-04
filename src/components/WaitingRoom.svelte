<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import PlayerTile from "./PlayerTile.svelte";

  interface Props { game: Game; title: string; subtitle: string }
  let { game, title, subtitle }: Props = $props();

  let progress = $derived(
    game.players.length ? game.readyCount / game.players.length : 0,
  );
</script>

<!-- Sale dos veces por partida (tras enviar la pregunta y tras las respuestas),
     así que vive aquí una sola vez en lugar de repetirse en las dos fases. -->
<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="radar" aria-hidden="true">
    {#each [0, 1, 2] as i}
      <i style="animation-delay:{i * 0.85}s"></i>
    {/each}
    <span>⏳</span>
  </div>

  <div class="copy">
    <h1>{title}</h1>
    <p class="dim">{subtitle}</p>
  </div>

  <div class="panel card">
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

  .radar { position: relative; height: 150px; display: grid; place-items: center; }
  .radar i {
    position: absolute; width: 120px; height: 120px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,.18);
    animation: ping 2.6s ease-out infinite;
  }
  .radar span { font-size: 54px; animation: tilt 1.6s ease-in-out infinite alternate; }
  @keyframes ping {
    from { transform: scale(.85); opacity: .9; }
    to { transform: scale(1.9); opacity: 0; }
  }
  @keyframes tilt {
    from { transform: rotate(-8deg); }
    to { transform: rotate(8deg); }
  }

  .copy { text-align: center; padding: 0 32px; }
  h1 { font-size: 28px; font-weight: 900; }
  .copy p { font-size: 14px; margin-top: 10px; line-height: 1.45; }

  .panel { margin: auto 20px 24px; padding: 24px; display: grid; gap: 16px; }
  .count { font-size: 14px; font-weight: 700; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px 10px; margin-top: 4px; }
</style>
