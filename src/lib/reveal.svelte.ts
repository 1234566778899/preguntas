import { haptic } from "./theme";
import type { RevealItem } from "./types";

/**
 * El ritmo de la revelación, compartido por el móvil y la pantalla grande.
 *
 * Cada pregunta pasa por dos momentos, como una pregunta de Kahoot: primero
 * sale sola, con un redoble, y luego caen las respuestas una a una. Es el
 * momento bueno de la partida y merece durar unos segundos. Se puede saltar
 * tocando, y con "Reducir movimiento" sale todo de golpe.
 *
 * Se crea durante la inicialización de un componente: usa `$effect`.
 */
export class RevealSequence {
  page = $state(0);
  /** `suspense` mientras la pregunta está sola; `answers` cuando caen las respuestas. */
  stage = $state<"suspense" | "answers">("suspense");
  visible = $state(0);

  #items: () => RevealItem[];

  constructor(items: () => RevealItem[], timing = { suspense: 1300, step: 700 }) {
    this.#items = items;

    $effect(() => {
      const item = this.#items()[this.page];
      if (!item) return;

      const total = item.answers.length;
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (calm) {
        this.stage = "answers";
        this.visible = total;
        return;
      }

      this.stage = "suspense";
      this.visible = 0;
      let cancelled = false;
      const timers: ReturnType<typeof setTimeout>[] = [];

      timers.push(setTimeout(() => {
        if (cancelled) return;
        this.stage = "answers";
        haptic.thud();
        for (let step = 1; step <= total; step++) {
          timers.push(setTimeout(() => {
            if (cancelled || this.visible >= step) return;
            this.visible = step;
            haptic.tap();
          }, (step - 1) * timing.step + 150));
        }
      }, timing.suspense));

      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    });
  }

  get items() {
    return this.#items();
  }

  get current(): RevealItem | undefined {
    return this.#items()[this.page];
  }

  get atEnd() {
    return this.page >= this.#items().length - 1;
  }

  get allShown() {
    return this.stage === "answers" && this.visible >= (this.current?.answers.length ?? 0);
  }

  turn(step: number) {
    const next = this.page + step;
    if (next < 0 || next >= this.#items().length) return;
    haptic.tap();
    this.page = next;
  }

  /** Enseña ya todo lo que queda de esta pregunta. */
  skip() {
    this.stage = "answers";
    this.visible = this.current?.answers.length ?? 0;
  }

  /** Lo que hace la barra espaciadora o tocar la tarjeta: si aún caen
   *  respuestas, las enseña todas; si ya están, pasa a la siguiente. */
  advance() {
    if (!this.allShown) this.skip();
    else this.turn(1);
  }
}
