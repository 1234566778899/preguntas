<script lang="ts">
  import type { Game } from "../../lib/game.svelte";
  import type { ReportKind } from "../../lib/types";
  import { haptic } from "../../lib/theme";
  import Icon from "./Icon.svelte";
  import Sheet from "./Sheet.svelte";

  interface Props {
    game: Game;
    kind: ReportKind;
    targetId: string;
  }

  let { game, kind, targetId }: Props = $props();

  let open = $state(false);
  let sent = $state(false);

  const reasons = [
    "Acoso o insultos",
    "Odio o violencia",
    "Contenido sexual",
    "Afecta a un menor",
    "Spam",
    "Otro motivo",
  ];

  function choose(reason: string) {
    open = false;
    sent = true;
    game.report(kind, targetId, reason);
  }
</script>

<!-- Deliberadamente discreta: tiene que estar siempre a mano, pero si pesa
     visualmente convierte un juego entre amigos en un panel de moderación. -->
<button
  class="flag press"
  class:sent
  aria-label={sent ? "Denunciado" : "Denunciar"}
  onclick={(e) => {
    e.stopPropagation();
    if (sent) return;
    haptic.tap();
    open = true;
  }}
>
  <Icon name={sent ? "check" : "flag"} size={15} weight={2.4} />
</button>

{#if open}
  <Sheet onclose={() => (open = false)}>
    <h3 class="title">Denunciar contenido</h3>
    <p class="dim">Nos llega una copia para revisarla. El resto del grupo no se entera.</p>
    {#each reasons as reason}
      <button class="reason sticker press" onclick={() => choose(reason)}>{reason}</button>
    {/each}
    <button class="cancel press" onclick={() => (open = false)}>Cancelar</button>
  </Sheet>
{/if}

<style>
  .flag {
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 8px;
    display: grid;
    place-items: center;
    color: var(--text-2);
  }

  .flag.sent {
    color: var(--ink);
    cursor: default;
  }

  h3 { font-size: 22px; }
  p { font-size: 14px; margin-bottom: 8px; line-height: 1.4; }

  .reason {
    --lift: 3px;
    height: 50px;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 800;
  }

  .cancel {
    height: 46px;
    margin-top: 4px;
    font-weight: 800;
    color: var(--text-2);
  }
</style>
