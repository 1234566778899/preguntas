# Anónimas — web

Versión web del juego, en Astro + Svelte 5 + TypeScript.

Comparte base de datos con la app de iOS: mismas funciones RPC, mismos códigos de
sala y mismos índices de avatar. **Alguien en el navegador y alguien en el iPhone
pueden jugar la misma partida**, sin que ninguno note de dónde está el otro.

## En local

```bash
npm install
cp .env.example .env    # y pega tus claves de Supabase
npm run dev
```

Se abre en http://localhost:4321.

Las claves son las mismas que están en `Anonimas/Config/Secrets.swift`. Si no
coinciden, cada versión jugará en su propio proyecto y no se verán entre ellas.

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo con recarga en caliente |
| `npm run build` | genera `dist/` |
| `npm run preview` | sirve `dist/` como lo hará Vercel |
| `npm run check` | comprueba tipos de Astro, Svelte y TypeScript |

## Subirlo a Vercel

El sitio es **estático**: todo el juego es una isla de Svelte que habla con
Supabase desde el navegador. No hay servidor, ni funciones, ni adaptador. Sale
gratis en el plan Hobby y no tiene arranque en frío.

### 1. Sube el repositorio a GitHub

Vercel despliega desde un repositorio. El `.env` está en `.gitignore`, así que
las claves **no** viajan: se ponen en el paso 3.

### 2. Importa el proyecto en Vercel

En [vercel.com/new](https://vercel.com/new), elige el repositorio y cambia una
cosa importante:

> **Root Directory → `web`**

Este repositorio tiene la app de iOS en la raíz y la web en `web/`. Si no lo
cambias, Vercel busca un `package.json` en la raíz y falla. El resto (framework
Astro, `npm install`, `astro build`, salida en `dist/`) lo detecta solo, y de
todas formas está escrito en `vercel.json`.

### 3. Variables de entorno

En Settings → Environment Variables, para Production, Preview y Development:

| Nombre | Valor |
|---|---|
| `PUBLIC_SUPABASE_URL` | `https://TU-PROYECTO.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | tu clave publishable |
| `PUBLIC_SUPPORT_EMAIL` | el mismo correo que sale en la app |
| `PUBLIC_SITE_URL` | `https://tu-proyecto.vercel.app` |

Ojo con dos cosas:

- **El prefijo `PUBLIC_` no es decorativo**: esas variables se incrustan en el
  JavaScript que descarga el navegador. Ahí solo va la clave *publishable*, nunca
  la `service_role`. Es exactamente igual que la clave dentro del binario de iOS:
  lo que protege los datos son las políticas de `supabase/schema.sql`.
- **Se leen al construir, no al arrancar.** Si cambias una, hay que volver a
  desplegar para que tenga efecto.

`PUBLIC_SITE_URL` solo sirve para que la imagen de previsualización (`/og.png`)
se enlace en absoluto, que es como la piden WhatsApp y X. Si la dejas vacía el
juego funciona igual, pero al compartir el enlace no sale la tarjeta bonita.

### 4. Deploy

Cada `push` a la rama principal publica en producción; cada rama y cada pull
request tienen su propia URL de vista previa.

Si prefieres no pasar por GitHub, desde `web/`:

```bash
npx vercel        # vista previa
npx vercel --prod # producción
```

## Qué hay dentro

```
src/
  pages/index.astro          la única página; carga el juego como isla
  components/
    Game.svelte              raíz: decide qué pantalla toca y anima el cambio
    AnimatedBackground.svelte manchas de color que se funden al cambiar de fase
    Confetti.svelte          canvas, para no crear cientos de elementos
    Terms, Home, Join, Lobby, Asking, Answering, Reveal, WaitingRoom
    ui/                      botones, avatar, barra superior, denuncia
  lib/
    game.svelte.ts           el motor: mismo GameStore que la app, con runes
    supabase.ts              cliente
    theme.ts                 paletas, avatares, máscaras y sugerencias
    types.ts                 sala, jugador, pregunta, respuesta
  styles/global.css          sistema de diseño portado de Theme.swift
public/
  og.png, favicon.svg, robots.txt
```

### Notas de portabilidad

- **Los índices de avatar viajan por la base de datos.** Si cambias el orden de
  `avatarEmojis` en `theme.ts` sin cambiarlo también en `Theme.swift`, un jugador
  de móvil se vería con otra cara en el navegador.
- **Las máscaras de la revelación** salen del primer byte del identificador de la
  respuesta, igual que en Swift, así que móvil y web enseñan la misma.
- **Tiempo real**: solo se escuchan `rooms` y `players`. Las preguntas no viajan
  por el canal a propósito — emitían el texto y el "fulanito ya envió" a la vez,
  y eso delataba al autor.
- **La tipografía** usa `ui-rounded` primero, que en Apple es la misma fuente que
  la app. En Windows y Android cae en Nunito, que se le parece.
