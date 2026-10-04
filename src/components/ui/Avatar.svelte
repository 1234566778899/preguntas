<script lang="ts">
  import { avatarImage, avatarColor } from "../../lib/theme";

  interface Props {
    index: number;
    size?: number;
    highlighted?: boolean;
  }

  let { index, size = 56, highlighted = false }: Props = $props();
</script>

<!-- AvatarBadge: círculo de color plano con contorno negro. Elegido, se
     levanta y deja ver su sombra dura. -->
<div
  class="avatar"
  class:on={highlighted}
  style="--s:{size}px; background:{avatarColor(index)}"
>
  <img src={avatarImage(index)} alt="" width={size} height={size} draggable="false" />
</div>

<style>
  .avatar {
    --lift: 3px;
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: none;
    border: var(--stroke) solid var(--ink);
    box-shadow: 0 0 0 var(--ink);
    transition:
      transform var(--pop),
      box-shadow var(--pop);
  }

  .on {
    border-width: 3px;
    transform: translate(calc(var(--lift) * -1), calc(var(--lift) * -1));
    box-shadow: calc(var(--lift) * 2) calc(var(--lift) * 2) 0 var(--ink);
  }

  /* El mismo margen que AvatarBadge en iOS: el personaje no toca el borde. */
  img {
    width: 80%;
    height: 80%;
    object-fit: contain;
  }
</style>
