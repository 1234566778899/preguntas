<script lang="ts" module>
  /**
   * Iconos de trazo en la tinta de la app. Hacen el papel de los SF Symbols de
   * iOS: en la interfaz no hay emojis, que en botones se ven de juguete.
   */
  const paths = {
    "arrow-right": "M5 12h14M13 6l6 6-6 6",
    "arrow-left": "M19 12H5M11 6l-6 6 6 6",
    "chevron-left": "M15 5l-7 7 7 7",
    "chevron-right": "M9 5l7 7-7 7",
    x: "M6 6l12 12M18 6L6 18",
    plus: "M12 5v14M5 12h14",
    play: "M8 5.5v13l10.5-6.5z",
    check: "M5 12.5l4.5 4.5L19 7.5",
    copy: "M9 9h10v11H9zM5 15V4h10",
    share: "M12 3v12M7 8l5-5 5 5M5 13v7h14v-7",
    refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6",
    camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7",
    flag: "M6 21V4M6 4h11l-2 4 2 4H6",
    crown: "M4 18h16M4 18L3 7l5 4 4-6 4 6 5-4-1 11",
    sparkles: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
    tv: "M3 6h18v12H3zM8 21h8",
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
    pencil: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
    send: "M4 12l16-8-6 16-3-7z",
    users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c1.9.8 3.1 2.6 3.5 5.2",
    ban: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M5.6 5.6l12.8 12.8",
    mask: "M3 9c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0-.5 4-2.5 6.5-5.5 6.5-1.8 0-2.8-1.2-3.5-2.5-.7 1.3-1.7 2.5-3.5 2.5C5.5 15.5 3.5 13 3 9M7.5 11h2M14.5 11h2",
    eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
    question: "M9 9a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.9V14M12 18h.01",
    moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5",
    glasses: "M2 12h3M19 12h3M5 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0M12 12a3.5 3.5 0 1 0 7 0",
    skip: "M5 5l9 7-9 7zM18 5v14",
    expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  } as const;

  export type IconName = keyof typeof paths;
</script>

<script lang="ts">
  interface Props {
    name: IconName;
    size?: number;
    /** Más grueso para botones grandes, como `.bold` en los SF Symbols. */
    weight?: number;
    filled?: boolean;
  }

  let { name, size = 18, weight = 2.6, filled = false }: Props = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill={filled ? "currentColor" : "none"}
  stroke="currentColor"
  stroke-width={weight}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={paths[name]} />
</svg>

<style>
  svg {
    flex: none;
    display: block;
  }
</style>
