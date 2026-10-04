<script lang="ts">
  import type { Game } from "../lib/game.svelte";
  import Avatar from "./ui/Avatar.svelte";
  import Button from "./ui/Button.svelte";
  import Icon from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import Sheet from "./ui/Sheet.svelte";
  import StoreBadges from "./ui/StoreBadges.svelte";
  import { avatarEmojis, haptic } from "../lib/theme";

  interface Props { game: Game; onterms: () => void; onhowto: () => void }
  let { game, onterms, onhowto }: Props = $props();

  let picking = $state(false);
</script>

<section class="screen">
  <div class="scroll">
    <!-- El rosa de la portada acaba en curva por detrás de la tarjeta, y abajo
         queda papel crema, igual que en HomeView.swift. -->
    <div class="paper" aria-hidden="true"></div>

    <header>
      <div class="row">
        <h1 aria-label="Anónimas">
          {#each "ANÓNIMAS".split("") as letter, i}
            <span style="animation-delay:{i * 40}ms">{letter}</span>
          {/each}
        </h1>
        <button class="howto sticker press" onclick={() => { haptic.tap(); onhowto(); }}>Cómo jugar</button>
      </div>
      <div class="row bottom">
        <p class="tagline">Preguntas anónimas.<br />Risas entre amigos.</p>
        <span class="mascot"><Mascot pose="hola" size={100} idle /></span>
      </div>
    </header>

    <div class="body">
      <div class="profile sticker">
        <h2>Tu perfil</h2>

        <button class="face press" aria-label="Cambiar tu cara"
          onclick={() => { haptic.tap(); picking = true; }}>
          <Avatar index={game.avatar} size={128} />
          <span class="edit"><Icon name="pencil" size={18} weight={2.8} /></span>
        </button>

        <label class="field">
          <span class="lbl">Tu apodo</span>
          <span class="input">
            <Icon name="users" size={20} weight={2.2} />
            <input
              placeholder="¿Cómo te llaman?"
              maxlength="24"
              value={game.name}
              autocomplete="nickname"
              oninput={(e) => game.setName(e.currentTarget.value)}
            />
          </span>
        </label>

        <hr />

        <p class="note">
          <Icon name="mask" size={32} weight={2} />
          <span>Tu apodo se ve en la sala.<br />Tus respuestas son anónimas.</span>
        </p>
      </div>

      <Button label="Crear sala" detail="Invita a tus amigos" icon="plus"
        enabled={!game.isBusy} busy={game.isBusy} onclick={() => game.createRoom()} />
      <Button label="Unirme con código" icon="arrow-right" variant="ghost"
        onclick={() => (game.route = "join")} />

      <button class="tv sticker press" onclick={() => { haptic.tap(); game.route = "screen"; }}>
        <Icon name="tv" size={22} weight={2.6} />
        <span class="words">
          <b>Pantalla grande</b>
          <small>Pon la partida en una tele o un portátil</small>
        </span>
        <Icon name="chevron-right" size={18} weight={3} />
      </button>

      <footer>
        <StoreBadges />
        <p class="free"><Icon name="check" size={18} weight={3} /> Sin registro. Entra y juega.</p>
        <button class="link press" onclick={onterms}>Normas y contacto</button>
      </footer>
    </div>
  </div>
</section>

{#if picking}
  <Sheet onclose={() => (picking = false)}>
    <h3 class="title">Elige tu cara</h3>
    <div class="faces">
      {#each avatarEmojis as _, i}
        <button class="press" aria-label="Cara {i + 1}" aria-pressed={game.avatar === i}
          onclick={() => { haptic.tap(); game.setAvatar(i); picking = false; }}>
          <Avatar index={i} size={64} highlighted={game.avatar === i} />
        </button>
      {/each}
    </div>
    <p class="dim more">Hay 12 caras más en la app para iPhone.</p>
  </Sheet>
{/if}

<style>
  .screen { height: 100%; }
  .scroll { position: relative; height: 100%; overflow-y: auto; overflow-x: hidden; background: var(--cream); }

  /* El rosa de arriba, con el borde de abajo curvo. */
  .paper {
    position: absolute; left: -10%; right: -10%; top: 0; height: 300px;
    background: var(--pink);
    border-radius: 0 0 50% 50% / 0 0 46px 46px;
  }

  header { position: relative; padding: 14px 22px 0; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .row.bottom { align-items: flex-end; margin-top: 6px; }

  h1 { font-family: var(--logo); font-weight: 900; font-size: clamp(30px, 10vw, 40px); letter-spacing: -0.5px; white-space: nowrap; }
  h1 span { display: inline-block; animation: rise 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  @keyframes rise { from { transform: translateY(26px); opacity: 0; } }

  .howto { --lift: 3px; padding: 9px 14px; border-radius: 20px; font-size: 15px; font-weight: 900; flex: none; }

  .tagline { font-size: clamp(20px, 6.6vw, 25px); font-weight: 900; line-height: 1.2; padding-bottom: 14px; }
  .mascot { flex: none; transform: translateY(14px); }

  .body { position: relative; display: grid; gap: 12px; padding: 0 20px 20px; }

  .profile { padding: 14px 20px; display: grid; gap: 12px; justify-items: center; border-radius: 26px; }
  h2 { font-size: 24px; font-weight: 900; }

  .face { position: relative; }
  .edit {
    position: absolute; right: -2px; bottom: -2px; width: 42px; height: 42px; border-radius: 50%;
    display: grid; place-items: center; background: var(--paper); border: var(--stroke) solid var(--ink);
  }

  .field { width: 100%; display: grid; gap: 8px; }
  .lbl { font-size: 16px; font-weight: 900; }
  .input {
    display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 14px;
    border: 1.5px solid var(--ink); border-radius: 12px; background: var(--paper);
  }
  .input input { flex: 1; min-width: 0; font-size: 19px; font-weight: 600; }

  hr { width: 100%; border: none; height: 1.5px; background: var(--divider); }

  .note { width: 100%; display: flex; align-items: center; gap: 14px; font-size: 15px; font-weight: 500; color: var(--text-2); line-height: 1.35; }

  .tv {
    --lift: 3px;
    display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 18px;
    background: var(--yellow); text-align: left;
  }
  .tv .words { flex: 1; display: grid; line-height: 1.2; }
  .tv b { font-size: 16px; font-weight: 900; }
  .tv small { font-size: 13px; font-weight: 600; color: var(--text-2); }

  footer { display: grid; gap: 10px; justify-items: center; padding-top: 6px; }
  .free { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; margin-top: 4px; }
  .link { font-size: 14px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }

  .faces { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 10px; justify-items: center; padding: 10px 0; }
  .more { font-size: 13px; text-align: center; }
</style>
