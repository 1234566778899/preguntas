<script lang="ts">
  import { fly, scale } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import PlayerTile from "./PlayerTile.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import { haptic } from "../lib/theme";

  interface Props { game: Game }
  let { game }: Props = $props();

  let copied = $state(false);

  async function copy() {
    const code = game.room?.code ?? "";
    try { await navigator.clipboard.writeText(code); } catch { /* sin permiso: da igual */ }
    haptic.success();
    copied = true;
    setTimeout(() => (copied = false), 1800);
  }
</script>

<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="scroll">
    <div class="code card">
      <p class="eyebrow">Código de la sala</p>
      <div class="letters">
        {#each (game.room?.code ?? "").split("") as letter, i}
          <span in:fly={{ y: 26, duration: 420, delay: i * 70 }}>{letter}</span>
        {/each}
      </div>
      <button class="chip press" onclick={copy}>
        {copied ? "✓ ¡Copiado!" : "⧉ Tocar para copiar"}
      </button>
    </div>

    <div class="roster">
      <div class="head">
        <h2>En la sala</h2>
        <span class="muted">{game.players.length}/12</span>
      </div>
      <div class="grid">
        {#each game.players as player, i (player.id)}
          <div in:fly={{ y: 18, duration: 400, delay: i * 50 }} out:scale={{ duration: 250, start: 0.5 }}>
            <PlayerTile {player} me={player.id === game.me?.id} />
          </div>
        {/each}
      </div>
    </div>
  </div>

  <footer>
    {#if game.isHost}
      <Button label="Empezar la partida" icon="▶" enabled={game.canStart && !game.isBusy}
        busy={game.isBusy} onclick={() => game.startGame()} />
      {#if !game.canStart}
        <p class="muted tiny" transition:fly={{ y: 8, duration: 250 }}>Falta al menos una persona más</p>
      {/if}
    {:else}
      <div class="waiting card">
        <WaitingDots />
        <span class="dim">Esperando a quien creó la sala</span>
      </div>
    {/if}
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .scroll { flex: 1; overflow-y: auto; padding: 6px 22px 8px; display: grid; gap: 30px; align-content: start; }

  .code { padding: 28px 20px; display: grid; gap: 16px; justify-items: center; }
  .letters { display: flex; gap: 8px; }
  .letters span {
    width: 46px; height: 60px; border-radius: 14px; display: grid; place-items: center;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18);
    font-size: 34px; font-weight: 900;
  }

  .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  h2 { font-size: 20px; font-weight: 800; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 14px; }

  footer { padding: 0 22px 16px; display: grid; gap: 10px; justify-items: center; }
  footer :global(.btn) { width: 100%; }
  .tiny { font-size: 12px; }
  .waiting { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 58px; border-radius: 29px; font-size: 15px; }
</style>
