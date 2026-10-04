import { backOut, elasticOut } from "svelte/easing";

/**
 * Entrada de los jugadores al lobby, al estilo Kahoot: la ficha cae desde
 * arriba, se pasa de tamaño y rebota hasta su sitio, un poco ladeada. Es lo que
 * hace que mirar el lobby mientras llega la gente tenga gracia.
 */
export function bounceIn(
  _node: Element,
  { delay = 0, duration = 900, tilt = 0 }: { delay?: number; duration?: number; tilt?: number } = {},
) {
  return {
    delay,
    duration,
    easing: elasticOut,
    css: (t: number, u: number) =>
      `transform: translateY(${-40 * u}px) scale(${t}) rotate(${tilt * u}deg); opacity: ${Math.min(1, t * 3)};`,
  };
}

/** Una pieza que aparece de golpe con un pequeño rebote: respuestas, papelitos. */
export function stamp(
  _node: Element,
  { delay = 0, duration = 420, tilt = 0 }: { delay?: number; duration?: number; tilt?: number } = {},
) {
  return {
    delay,
    duration,
    easing: backOut,
    css: (t: number, u: number) =>
      `transform: scale(${0.6 + 0.4 * t}) rotate(${tilt * t}deg) translateY(${20 * u}px); opacity: ${t};`,
  };
}

/** Inclinación estable para una ficha a partir de su id: así no baila al refrescar. */
export function tiltFor(id: string, range = 6): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 1000) / 1000 - 0.5) * 2 * range;
}
