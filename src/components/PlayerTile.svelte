<script lang="ts">
  import type { Player } from "../lib/types";
  import Avatar from "./ui/Avatar.svelte";

  interface Props { player: Player; me?: boolean; done?: boolean | null }
  let { player, me = false, done = null }: Props = $props();
</script>

<div class="tile" style="opacity:{done === false ? 0.45 : 1}">
  <div class="badge">
    <Avatar index={player.avatar} size={62} highlighted={me} />
    {#if player.is_host}<span class="crown">♛</span>{/if}
    {#if done !== null}<span class="state" class:on={done}>{done ? "✓" : "···"}</span>{/if}
  </div>
  <span class="name" class:me>{player.name}</span>
</div>

<style>
  .tile { display: grid; gap: 8px; justify-items: center; transition: opacity var(--pop); }
  .badge { position: relative; }
  .crown {
    position: absolute; top: -4px; right: -4px; width: 22px; height: 22px;
    border-radius: 50%; background: #ffc857; color: var(--ink);
    display: grid; place-items: center; font-size: 11px; font-weight: 900;
  }
  .state {
    position: absolute; bottom: -2px; right: -4px; min-width: 22px; height: 22px;
    padding: 0 5px; border-radius: 999px; background: rgba(255,255,255,.55); color: var(--ink);
    display: grid; place-items: center; font-size: 11px; font-weight: 900;
    transition: background var(--pop);
  }
  .state.on { background: #4ade80; }
  .name { font-size: 12px; font-weight: 700; color: var(--text-2); max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .name.me { color: var(--text); }
</style>
