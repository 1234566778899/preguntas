/** Acciones de Svelte reutilizables para detalles de interacción. */

/** Elementos que "merecen" el foco: si tocas uno, el teclado se queda. */
const KEEPS_FOCUS = "input, textarea, select, button, a, label, [contenteditable]";

/**
 * En web móvil, tocar fuera de un campo no cierra el teclado: el foco se queda
 * en el `<textarea>` y el teclado tapa el botón de enviar. Esto lo arregla —
 * al tocar una zona que no es un control, se le quita el foco al campo activo.
 *
 * Va en el contenedor con scroll de la pantalla, no en el `<textarea>`.
 */
export function dismissKeyboard(node: HTMLElement) {
  function onPointerDown(event: PointerEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest(KEEPS_FOCUS)) return;

    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
      active.blur();
    }
  }

  node.addEventListener("pointerdown", onPointerDown);
  return {
    destroy() {
      node.removeEventListener("pointerdown", onPointerDown);
    },
  };
}
