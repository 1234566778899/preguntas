<script lang="ts">
  import Button from "./ui/Button.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import Sheet from "./ui/Sheet.svelte";

  interface Props { onclose: () => void }
  let { onclose }: Props = $props();

  // Los mismos cuatro pasos que HowToPlaySheet en iOS.
  const steps = [
    ["Crea una sala", "Comparte el código de 5 letras con tu grupo. Entran con «Unirme con código»."],
    ["Todos preguntan", "Cada quien escribe una pregunta. Nadie sabe cuál es de quién."],
    ["Todos responden", "Respondes todas, incluida la tuya. Así no hay forma de adivinar quién preguntó."],
    ["Se revela todo", "Cada pregunta con sus respuestas, sin nombres. Y si quieren, otra ronda."],
  ];
</script>

<Sheet {onclose}>
  <h3 class="title">Cómo jugar</h3>
  <div class="says">
    <Mascot pose="pensando" size={84} idle />
    <p class="bubble sticker">Es fácil, te lo cuento en 4 pasos.</p>
  </div>
  <ol>
    {#each steps as [title, body], i}
      <li>
        <span class="n">{i + 1}</span>
        <div>
          <b>{title}</b>
          <p class="dim">{body}</p>
        </div>
      </li>
    {/each}
  </ol>
  <p class="dim tip">¿Tienen una tele cerca? Ábranla en «Pantalla grande» y verán todo en grande.</p>
  <Button label="¡Entendido!" icon="check" onclick={onclose} />
</Sheet>

<style>
  .says { display: flex; align-items: center; gap: 8px; }
  .bubble { --lift: 3px; padding: 10px 14px; border-radius: 16px; font-size: 16px; font-weight: 800; }
  ol { list-style: none; display: grid; gap: 16px; padding: 8px 0; }
  li { display: flex; gap: 14px; align-items: start; }
  .n {
    flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
    background: var(--ink); color: var(--paper); font-size: 16px; font-weight: 900;
  }
  b { font-size: 19px; font-weight: 900; }
  li p { font-size: 15px; line-height: 1.4; margin-top: 2px; }
  .tip { font-size: 14px; line-height: 1.4; margin-bottom: 6px; }
</style>
