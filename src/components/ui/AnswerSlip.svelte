<script lang="ts">
  import type { Game } from "../../lib/game.svelte";
  import type { Answer } from "../../lib/types";
  import { maskFor, maskTintFor } from "../../lib/theme";
  import AnswerImage from "./AnswerImage.svelte";
  import Icon from "./Icon.svelte";
  import ReportControl from "./ReportControl.svelte";

  interface Props {
    answer: Answer;
    /** Sin juego (pantalla grande) no hay denuncia: se denuncia desde un móvil. */
    game?: Game | null;
    imageUrl?: (path: string) => Promise<string | null>;
    big?: boolean;
  }

  let { answer, game = null, imageUrl, big = false }: Props = $props();

  // Las tres apps mandan "🤐" cuando alguien deja una respuesta en blanco.
  let blank = $derived(answer.text.trim() === "🤐" || (!answer.text.trim() && !answer.image_path));
</script>

<!-- AnswerBubble: la máscara y el color salen del identificador de la
     respuesta, no de quién la escribió. Distinguen una de otra, nada más. -->
<div class="slip" class:big style="--tint:{maskTintFor(answer.id)}">
  <span class="mask"><Icon name={maskFor(answer.id)} size={big ? 26 : 17} weight={2.4} /></span>
  <div class="paper">
    <div class="said">
      {#if blank}
        <p class="blank">Sin respuesta</p>
      {:else if answer.text}
        <p>{answer.text}</p>
      {/if}
      {#if answer.image_path && imageUrl}
        <AnswerImage path={answer.image_path} {imageUrl} />
      {/if}
    </div>
    {#if game}<ReportControl {game} kind="answer" targetId={answer.id} />{/if}
  </div>
</div>

<style>
  .slip { display: flex; gap: 12px; align-items: start; }
  .mask {
    width: 38px; height: 38px; flex: none; border-radius: 50%; display: grid; place-items: center;
    background: var(--tint); border: 2px solid var(--ink);
  }
  .paper {
    flex: 1; min-width: 0; display: flex; gap: 4px; align-items: start;
    padding: 11px 10px 11px 14px; border-radius: 14px;
    background: var(--tint); border: 2px solid var(--ink);
  }
  /* La respuesta puede ser texto, foto o las dos. */
  .said { flex: 1; min-width: 0; display: grid; gap: 8px; }
  /* Letra de máquina de escribir: la letra de nadie. */
  p { font-family: var(--mono); font-size: 16px; line-height: 1.55; overflow-wrap: anywhere; }
  .blank { font-style: italic; color: var(--text-2); }

  .big { gap: 18px; }
  .big .mask { width: 60px; height: 60px; border-width: 3px; }
  .big .paper { padding: 18px 22px; border-radius: 20px; border-width: 3px; box-shadow: 5px 5px 0 var(--ink); }
  .big p { font-size: clamp(20px, 2.2vw, 34px); line-height: 1.4; }
</style>
