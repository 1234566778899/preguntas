<script lang="ts">
  import { fly, scale } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import Icon from "./ui/Icon.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import PlayerTile from "./PlayerTile.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import { haptic } from "../lib/theme";
  import { joinUrl } from "../lib/links";
  import { bounceIn, tiltFor } from "../lib/transitions";

  interface Props { game: Game }
  let { game }: Props = $props();

  let copied = $state(false);
  let code = $derived(game.room?.code ?? "");

  async function copy() {
    try { await navigator.clipboard.writeText(code); } catch { /* sin permiso: da igual */ }
    haptic.success();
    copied = true;
    setTimeout(() => (copied = false), 1800);
  }

  // El mismo texto que ShareText.invite en iOS, con el enlace que ya trae el código.
  async function invite() {
    haptic.tap();
    const url = joinUrl(code);
    const text = `¡Juguemos a Anónimas! Entra a mi sala con el código ${code}`;
    if (navigator.share) {
      try { await navigator.share({ text, url }); } catch { /* cancelado */ }
      return;
    }
    try { await navigator.clipboard.writeText(`${text}\n\n${url}`); } catch { /* da igual */ }
    copied = true;
    setTimeout(() => (copied = false), 1800);
  }

  // El contador da un saltito cada vez que entra alguien.
  let bump = $state(0);
  let lastCount = 0;
  $effect(() => {
    const count = game.players.length;
    if (count > lastCount && lastCount > 0) { bump += 1; haptic.tap(); }
    lastCount = count;
  });
</script>

<section class="screen">
  <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

  <div class="scroll">
    <div class="code sticker">
      <p class="eyebrow">Código de la sala</p>
      <div class="letters" aria-label="Código de la sala: {code.split('').join(' ')}">
        {#each code.split("") as letter, i}
          <span in:fly={{ y: 26, duration: 420, delay: i * 70 }}>{letter}</span>
        {/each}
      </div>
      <div class="actions">
        <button class="chip press" onclick={copy}>
          <Icon name={copied ? "check" : "copy"} size={13} weight={3} />
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
        <button class="chip press" onclick={invite}>
          <Icon name="share" size={13} weight={3} /> Invitar
        </button>
      </div>
      <p class="dim hint">Pasa el código a tu grupo: entran con «Unirme con código».</p>
    </div>

    <div class="roster">
      <div class="head">
        <h2 class="title">En la sala</h2>
        {#key bump}
          <span class="count sticker" in:scale={{ start: 1.5, duration: 380 }}>
            <Icon name="users" size={16} weight={2.8} /> {game.players.length} de 12
          </span>
        {/key}
      </div>
      <div class="grid">
        {#each game.players as player, i (player.id)}
          <div in:bounceIn={{ delay: Math.min(i, 8) * 70, tilt: tiltFor(player.id, 14) }}
            out:scale={{ duration: 250, start: 0.5 }}>
            <PlayerTile {player} me={player.id === game.me?.id} />
          </div>
        {/each}
      </div>
    </div>

    <p class="tv dim"><Icon name="tv" size={16} weight={2.4} /> ¿Hay una tele cerca? Ábrela en «Pantalla grande» desde la portada.</p>
  </div>

  <footer>
    {#if game.isHost}
      <Button label="Empezar la partida" icon="play" enabled={game.canStart && !game.isBusy}
        busy={game.isBusy} onclick={() => game.startGame()} />
      {#if !game.canStart}
        <p class="dim tiny" transition:fly={{ y: 8, duration: 250 }}>Falta al menos una persona más</p>
      {/if}
    {:else}
      <div class="waiting sticker">
        <WaitingDots />
        <span>Esperando a quien creó la sala</span>
      </div>
    {/if}
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .scroll { flex: 1; overflow-y: auto; padding: 6px 22px 8px; display: grid; gap: 28px; align-content: start; }

  .code { padding: 24px 18px; display: grid; gap: 16px; justify-items: center; text-align: center; }
  .letters { display: flex; gap: 8px; }
  .letters span {
    width: 48px; height: 62px; border-radius: 12px; display: grid; place-items: center;
    background: var(--yellow); border: var(--stroke) solid var(--ink);
    font-family: var(--display); font-size: 32px;
  }
  .actions { display: flex; gap: 10px; }
  .hint { font-size: 15px; line-height: 1.35; padding: 0 12px; }

  .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .count { --lift: 3px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 15px; font-weight: 900; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 14px; padding-top: 8px; }

  .tv { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 1.35; }

  footer { padding: 0 22px 16px; display: grid; gap: 10px; justify-items: center; }
  .tiny { font-size: 14px; }
  .waiting { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 58px; border-radius: 18px; font-size: 16px; font-weight: 900; }
</style>
