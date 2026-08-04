import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  // Pon aquí tu dominio de Vercel cuando lo tengas: hace que la imagen de
  // previsualización se enlace en absoluto, que es como la piden WhatsApp y X.
  site: process.env.PUBLIC_SITE_URL || undefined,
  integrations: [svelte()],
});
