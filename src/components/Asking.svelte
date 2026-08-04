<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingRoom from "./WaitingRoom.svelte";
  import { haptic, randomPrompt } from "../lib/theme";

  interface Props { game: Game }
  let { game }: Props = $props();

  const LIMIT = 280;
  let text = $state("");
  let trimmed = $derived(text.trim());
</script>

{#if game.didSubmitQuestion}
  <WaitingRoom {game}
    title="Pregunta enviada"
    subtitle="En cuanto estén todas, empiezan las respuestas. Nadie sabrá cuál escribiste tú." />
{:else}
  <section class="screen">
    <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

    <div class="scroll">
      <div class="copy" in:fly={{ y: 22, duration: 420 }}>
        <h1>Escribe una pregunta</h1>
        <p class="dim">La responderá todo el grupo. Y no, nadie va a saber que fue tuya.</p>
      </div>

      <div class="editor card" in:fly={{ y: 22, duration: 420, delay: 60 }}>
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
        ✦ Dame una idea
      </button>
    </div>

    <footer>
      <Button label="Enviar pregunta" icon="➤" enabled={!!trimmed && !game.isBusy}
        busy={game.isBusy} onclick={() => game.submitQuestion(text)} />
    </footer>
  </section>
{/if}

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .scroll { flex: 1; overflow-y: auto; padding: 8px 20px; display: grid; gap: 24px; align-content: start; justify-items: center; }
  .copy { text-align: center; padding: 0 4px; }
  h1 { font-size: 28px; font-weight: 900; }
  .copy p { font-size: 14px; margin-top: 10px; line-height: 1.45; }
  .editor { width: 100%; padding: 20px; display: grid; gap: 10px; }
  textarea { width: 100%; font-size: 21px; font-weight: 700; line-height: 1.35; min-height: 96px; }
  .count { justify-self: end; font-size: 12px; color: var(--text-3); }
  .count.warn { color: #ffc857; }
  .idea { font-size: 13px; }
  footer { padding: 12px 22px 16px; }
</style>
