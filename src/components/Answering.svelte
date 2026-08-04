<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Button from "./ui/Button.svelte";
  import TopBar from "./ui/TopBar.svelte";
  import WaitingRoom from "./WaitingRoom.svelte";
  import WaitingDots from "./ui/WaitingDots.svelte";
  import ReportControl from "./ui/ReportControl.svelte";
  import { haptic } from "../lib/theme";

  interface Props { game: Game }
  let { game }: Props = $props();

  let index = $state(0);
  let forward = $state(true);
  // Las respuestas viven en memoria hasta el final, así se puede volver atrás
  // y cambiar de opinión antes de enviarlas todas juntas.
  let drafts = $state<Record<string, string>>({});

  let current = $derived(game.questions[index] ?? game.questions[0]);
  let isLast = $derived(index >= game.questions.length - 1);
  let answered = $derived(Object.values(drafts).filter((v) => v.trim()).length);

  function go(step: number) {
    haptic.tap();
    forward = step > 0;
    index = Math.max(0, Math.min(game.questions.length - 1, index + step));
  }
</script>

{#if game.didSubmitAnswers}
  <WaitingRoom {game}
    title="Respuestas enviadas"
    subtitle="Cuando todos terminen se revela todo de golpe." />
{:else if game.questions.length === 0}
  <div class="loading">
    <WaitingDots />
    <p class="dim">Recogiendo las preguntas…</p>
  </div>
{:else}
  <section class="screen">
    <TopBar {game} title="Ronda {game.room?.round ?? 1}" />

    <div class="progress">
      <div class="labels">
        <span>Pregunta {index + 1} de {game.questions.length}</span>
        <span class="muted">{answered} contestadas</span>
      </div>
      <div class="rail"><i style="width:{((index + 1) / game.questions.length) * 100}%"></i></div>
    </div>

    <div class="stage">
      {#key current.id}
        <div
          class="card qcard"
          in:fly={{ x: forward ? 260 : -260, duration: 380, opacity: 0 }}
          out:fly={{ x: forward ? -260 : 260, duration: 380, opacity: 0 }}
        >
          <div class="head">
            <span class="eyebrow">🎭 Alguien preguntó</span>
            <ReportControl {game} kind="question" targetId={current.id} />
          </div>
          <h1>{current.text}</h1>
          <hr />
          <textarea
            rows="3"
            placeholder="Tu respuesta anónima…"
            value={drafts[current.id] ?? ""}
            oninput={(e) => (drafts = { ...drafts, [current.id]: e.currentTarget.value })}
          ></textarea>
        </div>
      {/key}
    </div>

    <footer>
      {#if index > 0}
        <button class="back press" aria-label="Anterior" onclick={() => go(-1)}>‹</button>
      {/if}
      {#if isLast}
        <Button label="Enviar respuestas" icon="✓" enabled={!game.isBusy} busy={game.isBusy}
          onclick={() => game.submitAnswers(drafts)} />
      {:else}
        <Button label="Siguiente" icon="›" onclick={() => go(1)} />
      {/if}
    </footer>
  </section>
{/if}

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  .loading { height: 100%; display: grid; place-content: center; justify-items: center; gap: 18px; }

  .progress { padding: 0 24px 22px; display: grid; gap: 10px; }
  .labels { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; }

  .stage { flex: 1; position: relative; padding: 0 20px; overflow: hidden; }
  .qcard {
    position: absolute; inset: 0 20px; padding: 24px;
    display: grid; gap: 22px; align-content: start; border-radius: 32px;
  }
  .head { display: flex; align-items: center; justify-content: space-between; }
  h1 { font-size: 26px; font-weight: 900; line-height: 1.25; }
  hr { border: none; height: 1px; background: var(--stroke); }
  textarea { font-size: 19px; font-weight: 600; line-height: 1.4; min-height: 90px; }

  footer { display: flex; gap: 12px; padding: 12px 22px 16px; }
  .back {
    width: 58px; height: 58px; flex: none; border-radius: 29px; font-size: 22px;
    background: rgba(255,255,255,.08); border: 1px solid var(--stroke);
  }
</style>
