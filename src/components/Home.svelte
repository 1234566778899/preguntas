<script lang="ts">
  import { fly } from "svelte/transition";
  import type { Game } from "../lib/game.svelte";
  import Avatar from "./ui/Avatar.svelte";
  import Button from "./ui/Button.svelte";
  import { avatarEmojis, haptic } from "../lib/theme";
  import { appStoreUrl } from "../lib/links";

  interface Props { game: Game; onterms: () => void }
  let { game, onterms }: Props = $props();

  let strip = $state<HTMLDivElement | null>(null);

  // El avatar guardado puede estar fuera de pantalla: si no se centra, parece
  // que no hay nada elegido.
  $effect(() => {
    const el = strip?.children[game.avatar] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  });
</script>

<section class="screen">
  <div class="marks" aria-hidden="true">
    {#each [[12,18,84,0],[84,26,56,1.2],[22,74,62,.6],[78,82,96,1.8],[52,10,44,2.4]] as [x,y,s,d]}
      <span style="left:{x}%; top:{y}%; font-size:{s}px; animation-delay:{d}s">?</span>
    {/each}
  </div>

  <div class="logo">
    <h1>
      {#each "ANÓNIMAS".split("") as letter, i}
        <span in:fly={{ y: 34, duration: 460, delay: i * 45 }}>{letter}</span>
      {/each}
    </h1>
    <p class="dim" in:fly={{ y: 22, duration: 420, delay: 400 }}>preguntas que nadie firma</p>
  </div>

  <div class="setup" in:fly={{ y: 22, duration: 420, delay: 460 }}>
    <p class="eyebrow">Elige tu cara</p>
    <div class="strip" bind:this={strip}>
      {#each avatarEmojis as _, i}
        <button
          class="press"
          aria-label="Avatar {i + 1}"
          onclick={() => { haptic.tap(); game.setAvatar(i); }}
          style="opacity:{game.avatar === i ? 1 : 0.55}"
        >
          <Avatar index={i} size={58} highlighted={game.avatar === i} />
        </button>
      {/each}
    </div>

    <label class="field card">
      <Avatar index={game.avatar} size={40} />
      <input
        placeholder="¿Cómo te llaman?"
        maxlength="24"
        value={game.name}
        oninput={(e) => game.setName(e.currentTarget.value)}
      />
    </label>
  </div>

  <footer in:fly={{ y: 22, duration: 420, delay: 520 }}>
    <Button label="Crear sala" icon="✨" enabled={!game.isBusy} busy={game.isBusy}
      onclick={() => game.createRoom()} />
    <Button label="Unirme con un código" icon="→" variant="ghost"
      onclick={() => (game.route = "join")} />
    <!-- La app y la web comparten salas, así que el enlace es un extra, no un
         muro: se puede jugar sin instalar nada. -->
    <a class="store press" href={appStoreUrl} target="_blank" rel="noopener">
      <svg viewBox="0 0 384 512" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
      </svg>
      <span>Descárgala para iPhone</span>
    </a>
    <p class="muted tiny">Sin cuentas. Sin nombres en las respuestas.</p>
    <button class="link press" onclick={onterms}>Normas y contacto</button>
  </footer>
</section>

<style>
  .screen { display: flex; flex-direction: column; height: 100%; position: relative; }

  .marks { position: absolute; inset: 0; pointer-events: none; }
  .marks span {
    position: absolute; font-weight: 900; color: rgba(255,255,255,.06);
    animation: float 11s ease-in-out infinite alternate;
  }
  @keyframes float {
    from { transform: translateY(18px) rotate(-6deg); }
    to { transform: translateY(-18px) rotate(6deg); }
  }

  .logo { text-align: center; padding: 6vh 0 0; }
  h1 { font-size: clamp(38px, 12vw, 52px); font-weight: 900; letter-spacing: 1px; }
  h1 span { display: inline-block; text-shadow: 0 8px 18px rgba(0,0,0,.35); }
  .logo p { font-size: 14px; margin-top: 10px; }

  .setup { margin-top: auto; padding: 0 24px; display: grid; gap: 12px; }
  .strip {
    display: flex; gap: 12px; overflow-x: auto; padding: 6px 2px;
    scrollbar-width: none; scroll-behavior: smooth;
  }
  .strip::-webkit-scrollbar { display: none; }
  .strip button { flex: none; transition: opacity var(--pop); }

  .field { display: flex; align-items: center; gap: 14px; padding: 0 16px; height: 68px; border-radius: 34px; }
  .field input { flex: 1; font-size: 19px; font-weight: 700; min-width: 0; }

  footer { margin-top: auto; padding: 24px; display: grid; gap: 12px; justify-items: center; }
  footer :global(.btn) { width: 100%; }
  .store {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 2px; padding: 10px 18px; border-radius: 999px;
    background: rgba(255,255,255,.08); border: 1px solid var(--stroke);
    color: var(--text); font-size: 14px; font-weight: 700; text-decoration: none;
  }
  .store svg { margin-top: -2px; }

  .tiny { font-size: 12px; margin-top: 6px; }
  .link { font-size: 12px; color: var(--text-2); text-decoration: underline; }
</style>
