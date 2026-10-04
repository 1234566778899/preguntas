<script lang="ts">
  import { fly } from "svelte/transition";
  import Button from "./ui/Button.svelte";
  import Icon, { type IconName } from "./ui/Icon.svelte";
  import Mascot from "./ui/Mascot.svelte";
  import { supportEmail } from "../lib/supabase";

  interface Props { onaccept?: () => void; onclose?: () => void }
  let { onaccept, onclose }: Props = $props();

  const rules: [IconName, string, string][] = [
    ["ban", "Nada de acoso ni odio", "Insultos, amenazas, contenido sexual o dirigido a menores: fuera. Sin excepciones y sin avisos."],
    ["mask", "Anónimo no es impune", "Nadie sabe quién escribió qué, pero cada partida se puede denunciar y las denuncias se revisan."],
    ["flag", "Denuncia lo que veas", "Toca la banderita en cualquier pregunta o respuesta. Llega directo, sin pasar por el resto del grupo."],
  ];
</script>

<section class="screen">
  {#if onclose}
    <header>
      <button class="round sticker press" onclick={onclose} aria-label="Volver">
        <Icon name="arrow-left" size={18} weight={3} />
      </button>
    </header>
  {/if}

  <div class="scroll">
    <div class="intro" in:fly={{ y: 22, duration: 420 }}>
      <Mascot pose="hola" size={96} idle />
      <h1 class="title">Antes de jugar</h1>
      <p class="dim sub">Esto va de preguntas incómodas entre amigos, no de hacer daño.</p>
    </div>

    <div class="sticker rules" in:fly={{ y: 22, duration: 420, delay: 60 }}>
      {#each rules as [icon, title, body]}
        <div class="rule">
          <span class="disc"><Icon name={icon} size={16} weight={2.6} /></span>
          <div>
            <h2>{title}</h2>
            <p class="dim">{body}</p>
          </div>
        </div>
      {/each}
    </div>

    <div in:fly={{ y: 22, duration: 420, delay: 120 }}>
      <p class="eyebrow">¿Algo que contarnos?</p>
      <a class="mail" href="mailto:{supportEmail}">{supportEmail}</a>
      <!-- Las dos páginas que App Store Connect pide por URL pública. Se abren
           fuera para no tumbar la partida que haya en marcha. -->
      <nav class="links">
        <a href="/soporte" target="_blank" rel="noopener">Soporte</a>
        <a href="/privacidad" target="_blank" rel="noopener">Privacidad</a>
      </nav>
    </div>

    <p class="dim tiny" in:fly={{ y: 22, duration: 420, delay: 180 }}>
      Al continuar aceptas estas normas. Quien las incumpla pierde el acceso.
    </p>
  </div>

  {#if onaccept}
    <footer><Button label="Acepto, a jugar" icon="check" onclick={onaccept} /></footer>
  {/if}
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  header { padding: 8px 20px 0; }
  .round { --lift: 3px; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; }
  .scroll { flex: 1; overflow-y: auto; padding: 20px 22px; display: grid; gap: 22px; align-content: start; }
  .intro { display: grid; justify-items: start; gap: 8px; }
  .sub { font-size: 16px; line-height: 1.4; }
  .rules { padding: 20px; display: grid; gap: 18px; }
  .rule { display: flex; gap: 14px; align-items: start; }
  .disc {
    flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
    background: var(--ink); color: var(--paper);
  }
  h2 { font-size: 19px; font-weight: 900; margin-bottom: 4px; }
  .rule p { font-size: 15px; line-height: 1.4; }
  .mail { display: block; margin-top: 8px; font-size: 17px; font-weight: 800; color: var(--text); word-break: break-all; }
  .links { display: flex; gap: 18px; margin-top: 12px; }
  .links a { font-size: 14px; font-weight: 800; color: var(--text); }
  .tiny { font-size: 13px; line-height: 1.5; }
  footer { padding: 0 22px 20px; }
</style>
