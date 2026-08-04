<script lang="ts">
  import { fly } from "svelte/transition";
  import Button from "./ui/Button.svelte";
  import { supportEmail } from "../lib/supabase";

  interface Props { onaccept?: () => void; onclose?: () => void }
  let { onaccept, onclose }: Props = $props();

  const rules = [
    ["🚫", "Nada de acoso ni odio", "Insultos, amenazas, contenido sexual o dirigido a menores: fuera. Sin excepciones y sin avisos."],
    ["🎭", "Anónimo no es impune", "Nadie sabe quién escribió qué, pero cada partida se puede denunciar y las denuncias se revisan."],
    ["🚩", "Denuncia lo que veas", "Toca la banderita en cualquier pregunta o respuesta. Llega directo, sin pasar por el resto del grupo."],
  ];
</script>

<section class="screen">
  {#if onclose}
    <header><button class="round press" onclick={onclose} aria-label="Volver">‹</button></header>
  {/if}

  <div class="scroll">
    <div in:fly={{ y: 22, duration: 420, delay: 0 }}>
      <h1>Antes de jugar</h1>
      <p class="dim sub">Esto va de preguntas incómodas entre amigos, no de hacer daño.</p>
    </div>

    <div class="card rules" in:fly={{ y: 22, duration: 420, delay: 60 }}>
      {#each rules as [emoji, title, body]}
        <div class="rule">
          <span class="emoji">{emoji}</span>
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

    <p class="muted tiny" in:fly={{ y: 22, duration: 420, delay: 180 }}>
      Al continuar aceptas estas normas. Quien las incumpla pierde el acceso.
    </p>
  </div>

  {#if onaccept}
    <footer><Button label="Acepto, a jugar" icon="✓" onclick={onaccept} /></footer>
  {/if}
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; }
  header { padding: 8px 20px 0; }
  .round {
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,.08); border: 1px solid var(--stroke); font-size: 20px;
  }
  .scroll { flex: 1; overflow-y: auto; padding: 24px; display: grid; gap: 24px; align-content: start; }
  h1 { font-size: 30px; font-weight: 900; }
  .sub { font-size: 14px; margin-top: 8px; }
  .rules { padding: 22px; display: grid; gap: 18px; }
  .rule { display: flex; gap: 14px; align-items: start; }
  .emoji { font-size: 24px; line-height: 1.2; }
  h2 { font-size: 19px; font-weight: 800; margin-bottom: 4px; }
  .rule p { font-size: 14px; line-height: 1.45; }
  .mail { display: block; margin-top: 8px; font-size: 17px; color: var(--text); text-decoration: none; word-break: break-all; }
  .links { display: flex; gap: 18px; margin-top: 12px; }
  .links a { font-size: 13px; font-weight: 700; color: var(--text-2); }
  .tiny { font-size: 12px; line-height: 1.5; }
  footer { padding: 0 24px 20px; }
</style>
