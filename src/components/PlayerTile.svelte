<script lang="ts">
  import type { Player } from "../lib/types";
  import Avatar from "./ui/Avatar.svelte";
  import Icon from "./ui/Icon.svelte";

  interface Props { player: Player; me?: boolean; done?: boolean | null; size?: number }
  let { player, me = false, done = null, size = 62 }: Props = $props();
</script>

<div class="tile" style="--s:{size}px">
  <div class="badge">
    <!-- Quien aún no termina se ve apagado, pero solo la cara: el nombre se sigue leyendo. -->
    <div class="face" style="opacity:{done === false ? 0.45 : 1}">
      <Avatar index={player.avatar} {size} highlighted={me} />
    </div>
    {#if player.is_host}
      <span class="mark crown" title="Creó la sala"><Icon name="crown" size={size * 0.18} weight={3} /></span>
    {/if}
    {#if done !== null}
      <span class="mark state" class:on={done}>
        {#if done}<Icon name="check" size={size * 0.18} weight={3.4} />{:else}···{/if}
      </span>
    {/if}
  </div>
  <span class="name" class:me>{player.name}</span>
</div>

<style>
  .tile { display: grid; gap: 8px; justify-items: center; min-width: 0; }
  .badge { position: relative; }
  .face { transition: opacity var(--pop); }

  .mark {
    position: absolute;
    width: calc(var(--s) * 0.38); height: calc(var(--s) * 0.38);
    min-width: 24px; min-height: 24px;
    border-radius: 50%; border: 2px solid var(--ink);
    display: grid; place-items: center;
    font-size: 11px; font-weight: 900; line-height: 1;
    transition: background var(--pop);
  }
  .crown { top: -4px; right: -4px; background: var(--yellow); }
  .state { bottom: -4px; right: -4px; background: var(--paper); }
  .state.on { background: var(--done); }

  .name {
    font-size: calc(var(--s) * 0.22); font-weight: 700; max-width: calc(var(--s) * 1.5);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .name.me { font-weight: 900; }
</style>
