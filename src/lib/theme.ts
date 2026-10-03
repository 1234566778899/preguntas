import type { GamePhase } from "./types";

/** Mismos colores que PhasePalette en Anonimas/Design/Theme.swift. */
export interface Palette {
  key: string;
  top: string;
  mid: string;
  bottom: string;
}

export const palettes: Record<string, Palette> = {
  home: { key: "home", top: "#7C5CFF", mid: "#4338CA", bottom: "#22D3EE" },
  lobby: { key: "lobby", top: "#38BDF8", mid: "#6366F1", bottom: "#C084FC" },
  asking: { key: "asking", top: "#FF5C8A", mid: "#F43F5E", bottom: "#FF9F45" },
  answering: { key: "answering", top: "#22D3A7", mid: "#0EA5E9", bottom: "#A3E635" },
  reveal: { key: "reveal", top: "#FFC857", mid: "#F43FA5", bottom: "#8B5CF6" },
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

const avatarGradients = [
  ["#FF9A56", "#FF5C8A"],
  ["#38BDF8", "#6366F1"],
  ["#22D3A7", "#84CC16"],
  ["#C084FC", "#7C3AED"],
  ["#F43F5E", "#F97316"],
  ["#0EA5E9", "#22D3EE"],
  ["#FACC15", "#FB923C"],
  ["#EC4899", "#8B5CF6"],
];

// Avatares premium de iOS (índices 24-35, se compran en la App Store). Aquí no
// se pueden elegir, pero quien juega con uno desde un iPhone tiene que verse
// con su emoji, no con el de otro.
const premiumAvatarEmojis = [
  "🐲", "😼", "🐶", "🦊", "🐼", "🐸", "🦈", "🦉", "🐰", "🐙", "🐦‍🔥", "🧛",
];

export function avatarEmoji(index: number): string {
  const premium = index - avatarEmojis.length;
  if (premium >= 0 && premium < premiumAvatarEmojis.length) return premiumAvatarEmojis[premium];
  return avatarEmojis[Math.abs(index) % avatarEmojis.length];
}

export function avatarGradient(index: number): string {
  const [a, b] = avatarGradients[Math.abs(index) % avatarGradients.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function randomAvatar(): number {
  return Math.floor(Math.random() * avatarEmojis.length);
}

/** Máscaras de la revelación. Salen del identificador de la respuesta, nunca de
 *  quien la escribió: sirven para distinguir respuestas, no para identificar. */
const masks = ["🎭", "👤", "🕶️", "🥸", "👻", "🫥", "🎃", "🤿"];
const maskTints = ["#FF9A56", "#38BDF8", "#22D3A7", "#C084FC", "#F43F5E", "#FACC15"];

/** Primer byte del UUID, igual que `answer.id.uuid.0` en Swift. */
function seedOf(uuid: string): number {
  return parseInt(uuid.slice(0, 2), 16) || 0;
}

export function maskFor(uuid: string): string {
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
