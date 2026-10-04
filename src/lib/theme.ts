import type { GamePhase } from "./types";
import type { IconName } from "../components/ui/Icon.svelte";

/** Mismos colores que PhasePalette en Anonimas/Design/Theme.swift: un color
 *  plano por fase, para que el grupo sepa en qué momento está la partida sin
 *  leer nada. `pop` es el color de apoyo (lo elegido, lo que destaca). */
export interface Palette {
  key: string;
  background: string;
  pop: string;
}

const pink = "#F7639A";
const yellow = "#F9C74F";
const green = "#43CC96";
const blue = "#5DB8F0";
const violet = "#9479FF";

export const palettes: Record<string, Palette> = {
  home: { key: "home", background: pink, pop: yellow },
  lobby: { key: "lobby", background: yellow, pop: pink },
  asking: { key: "asking", background: green, pop: yellow },
  answering: { key: "answering", background: blue, pop: yellow },
  reveal: { key: "reveal", background: violet, pop: yellow },
};

export function paletteFor(phase: GamePhase): Palette {
  return palettes[phase] ?? palettes.home;
}

/** Los 24 avatares de la app, en el mismo orden: el índice viaja en la base de
 *  datos, así que si cambia el orden un jugador de móvil se vería distinto en web. */
export const avatarEmojis = [
  "🦊", "🐼", "🐸", "🦄", "🐙", "🦋", "🐝", "🦕",
  "🐳", "🦁", "🐨", "🦉", "🐧", "🦖", "🐢", "🦩",
  "👾", "🤖", "🎃", "👻", "🍄", "⭐️", "🔥", "🌈",
];

/** Avatars.colors: planos, como las pegatinas. El contorno negro los separa
 *  del fondo aunque coincidan. */
const avatarColors = [
  "#FF9A4D", "#5DB8F0", "#43CC96", "#9479FF", "#F7639A", "#B8E86B", "#F9C74F", "#FFFFFF",
];

/** Cuántas caras hay en total: las 24 gratis y las 12 premium de iOS (24-35).
 *  Las premium se compran en la App Store y aquí no se pueden elegir, pero quien
 *  juega con una desde un iPhone tiene que verse con su cara, no con la de otro. */
const avatarCount = avatarEmojis.length + 12;

/** Igual que `Avatars.clamp` en Swift: un índice raro cae en una cara gratis. */
function clampAvatar(index: number): number {
  return index >= 0 && index < avatarCount ? index : Math.abs(index) % avatarEmojis.length;
}

/** Las mismas ilustraciones que Assets.xcassets/Avatars, en `public/avatares`. */
export function avatarImage(index: number): string {
  return `/avatares/avatar-${String(clampAvatar(index)).padStart(2, "0")}.webp`;
}

export function avatarColor(index: number): string {
  return avatarColors[clampAvatar(index) % avatarColors.length];
}

export function randomAvatar(): number {
  return Math.floor(Math.random() * avatarEmojis.length);
}

/** Máscaras de la revelación. Salen del identificador de la respuesta, nunca de
 *  quien la escribió: sirven para distinguir respuestas, no para identificar. */
const masks: IconName[] = ["mask", "glasses", "eye", "question", "moon", "sparkles"];
/** Tonos pastel de los papelitos (AnswerBubble.tints): el negro se lee en todos. */
const maskTints = ["#FFE3CC", "#D6EEFB", "#D5F4E7", "#E6E0FF", "#FDDDE9", "#FDF0CC"];

/** Primer byte del UUID, igual que `answer.id.uuid.0` en Swift. */
function seedOf(uuid: string): number {
  return parseInt(uuid.slice(0, 2), 16) || 0;
}

export function maskFor(uuid: string): IconName {
  return masks[seedOf(uuid) % masks.length];
}

export function maskTintFor(uuid: string): string {
  return maskTints[seedOf(uuid) % maskTints.length];
}

/** Las 18 sugerencias de Prompts en AskingView.swift. */
export const prompts = [
  "¿Cuál es la mentira más grande que has dicho aquí?",
  "¿Qué es lo más raro que has buscado en internet?",
  "Si pudieras borrar un recuerdo, ¿cuál sería?",
  "¿Qué canción pones cuando no te ve nadie?",
  "¿Qué le dirías a quien te rompió el corazón?",
  "¿Cuál es tu peor hábito y aún no lo dejas?",
  "¿A quién de este grupo llamarías a las 3 a. m.?",
  "¿Qué cosa te da miedo admitir en voz alta?",
  "¿Cuál ha sido tu momento más vergonzoso?",
  "¿Qué harías si mañana nadie te juzgara?",
  "¿Qué opinión impopular defenderías hasta el final?",
  "¿Qué es lo primero que piensas al despertar?",
  "¿Cuál es la excusa que más repites?",
  "¿Qué te hace llorar aunque no lo cuentes?",
  "¿Qué versión de ti extrañas?",
  "¿Cuánto dinero necesitarías para irte para siempre?",
  "¿Qué mensaje te arrepientes de haber enviado?",
  "¿A qué le tienes más miedo del futuro?",
];

export function randomPrompt(excluding: string): string {
  const pool = prompts.filter((p) => p !== excluding);
  return pool[Math.floor(Math.random() * pool.length)] ?? prompts[0];
}

/** Vibración en móviles que la soporten. El equivalente a Haptic en la app;
 *  en escritorio no hace nada y no pasa nada. */
export const haptic = {
  tap: () => navigator.vibrate?.(8),
  press: () => navigator.vibrate?.(14),
  thud: () => navigator.vibrate?.(24),
  success: () => navigator.vibrate?.([12, 40, 18]),
  failure: () => navigator.vibrate?.([28, 60, 28]),
};

/** Cuenta atrás de cada fase, como el reloj de Kahoot. Solo empuja: al llegar a
 *  cero nadie pierde lo que escribió, pero el grupo ve que alguien se atasca. */
export const timers = {
  /** Segundos para escribir la pregunta. */
  asking: 75,
  /** Segundos por pregunta al responder, con un mínimo para partidas cortas. */
  perAnswer: 25,
  minAnswering: 50,
};

export function answeringSeconds(questions: number): number {
  return Math.max(timers.minAnswering, questions * timers.perAnswer);
}
