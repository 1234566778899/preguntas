<script lang="ts">
  import { avatarEmoji, avatarGradient } from "../../lib/theme";

  interface Props {
    index: number;
    size?: number;
    highlighted?: boolean;
  }

  let { index, size = 56, highlighted = false }: Props = $props();
</script>

<div
  class="avatar"
  class:on={highlighted}
  style="--s:{size}px; background:{avatarGradient(index)}"
>
  <span style="font-size:{size * 0.5}px">{avatarEmoji(index)}</span>
</div>

<style>
  .avatar {
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: none;
    border: 1.5px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition:
      transform var(--pop),
      border-color var(--pop);
  }

  .on {
    border: 3px solid rgba(255, 255, 255, 0.95);
    transform: scale(1.06);
  }

  span {
    line-height: 1;
  }
</style>
