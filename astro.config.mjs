// Configuración de Astro.
// `site` + `base` hacen que las rutas funcionen en https://kanarath.github.io/forja-art/
// `mdx()` permite escribir lecciones en Markdown con componentes dentro.
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://kanarath.github.io",
  base: "/forja-art",
  trailingSlash: "ignore",
  integrations: [mdx()],
});
