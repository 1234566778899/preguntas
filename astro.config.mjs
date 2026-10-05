import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // El dominio va fijo como respaldo porque astro.config no lee el .env: así
  // la imagen de previsualización (WhatsApp y X la piden en absoluto) y el
  // sitemap salen bien aunque falte la variable.
  site: process.env.PUBLIC_SITE_URL || "https://www.preguntas.site",
  integrations: [svelte(), sitemap()],
});
