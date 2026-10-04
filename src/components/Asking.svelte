<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import Countdown from "./ui/Countdown.svelte";
  import Icon from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingRoom from "./WaitingRoom.svelte";
  import { haptic, randomPrompt, timers } from "../lib/theme";
  import { dismissKeyboard } from "../lib/actions";

  interface Props { game: Game }
  let { game }: Props = $props();

  const LIMIT = 280;
  let text = $state("");
  let allowsImages = $state(false);
  let trimmed = $derived(text.trim());
</script>

{#if game.didSubmitQuestion}
  <WaitingRoom {game} seconds={timers.asking}
    title="Pregunta enviada"
    subtitle="En cuanto estén todas, empiezan las respuestas. Nadie sabrá cuál escribiste tú." />
{:else}
  <section class="screen" use:dismissKeyboard>
    <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

    <div class="timer"><Countdown seconds={timers.asking} startedAt={game.phaseStartedAt} /></div>

    <div class="scroll">
      <div class="copy" in:fly={{ y: 22, duration: 420 }}>
        <Mascot pose="pensando" size={92} idle />
        <h1 class="title">Escribe una pregunta</h1>
        <p class="dim">La responderá todo el grupo. Y no, nadie va a saber que fue tuya.</p>
      </div>

      <div class="editor sticker" in:fly={{ y: 22, duration: 420, delay: 60 }}>
        <textarea
          bind:value={text}
          maxlength={LIMIT}
          rows="4"
          placeholder="¿Qué te da vergüenza admitir?"
        ></textarea>
        <span class="count" class:warn={text.length > LIMIT - 30}>{text.length}/{LIMIT}</span>
      </div>

      <button class="chip press idea" in:fly={{ y: 22, duration: 420, delay: 120 }}
        onclick={() => { haptic.tap(); text = randomPrompt(text); }}>
        <Icon name="sparkles" size={14} weight={2.4} /> Dame una idea
      </button>

      <!-- El permiso viaja con la pregunta, no con la sala: tiene sentido en
           "enseña tu escritorio" y ninguno en "¿a quién besarías?". -->
      <label class="sticker toggle" in:fly={{ y: 22, duration: 420, delay: 180 }}>
        <div class="what">
          <span class="name"><Icon name="camera" size={17} weight={2.6} /> Se puede responder con foto</span>
          <span class="dim note">
            {allowsImages
              ? "Recuerda: una foto delata mucho más que un texto."
              : "Solo para esta pregunta."}
          </span>
        </div>
        <input
          type="checkbox"
          bind:checked={allowsImages}
          onchange={() => haptic.tap()}
        />
        <span class="switch" aria-hidden="true"></span>
      </label>
    </div>

    <footer>
      <Button label="Enviar pregunta" icon="send" enabled={!!trimmed && !game.isBusy}
        busy={game.isBusy} onclick={() => game.submitQuestion(text, allowsImages)} />
    </footer>
  </section>
{/if}

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .timer { padding: 0 22px 10px; }
  .scroll { flex: 1; overflow-y: auto; padding: 8px 20px; display: grid; gap: 22px; align-content: start; justify-items: center; }
  .copy { text-align: center; padding: 0 4px; display: grid; justify-items: center; gap: 6px; }
  .copy p { font-size: 16px; line-height: 1.4; }
  .editor { width: 100%; padding: 18px; display: grid; gap: 10px; }
  textarea { width: 100%; font-size: 22px; font-weight: 800; line-height: 1.3; min-height: 96px; }
  .count { justify-self: end; font-size: 13px; font-weight: 700; color: var(--text-3); }
  .count.warn { color: var(--warning); }
  .idea { font-size: 14px; }

  .toggle {
    width: 100%; padding: 16px 18px; display: flex; align-items: center; gap: 14px;
    cursor: pointer; border-radius: 20px;
  }
  .what { flex: 1; display: grid; gap: 3px; }
  .name { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 900; }
  .note { font-size: 13px; line-height: 1.35; }

  /* El checkbox real sigue ahí, solo que invisible: así el teclado y los
     lectores de pantalla lo encuentran igual. */
  .toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
  .switch {
    flex: none; width: 54px; height: 32px; border-radius: 999px; position: relative;
    background: var(--paper); border: var(--stroke) solid var(--ink);
    transition: background var(--pop);
  }
  .switch::after {
    content: ""; position: absolute; top: 3px; left: 3px;
    width: 21px; height: 21px; border-radius: 50%; background: var(--ink);
    transition: transform var(--pop), background var(--pop);
  }
  .toggle input:checked ~ .switch { background: var(--ink); }
  .toggle input:checked ~ .switch::after { transform: translateX(22px); background: var(--paper); }
  .toggle input:focus-visible ~ .switch { outline: 3px solid var(--ink); outline-offset: 3px; }
  footer { padding: 12px 22px 16px; }
</style>
