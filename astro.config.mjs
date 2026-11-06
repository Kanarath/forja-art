// Configuración de Astro.
// `site` + `base` hacen que las rutas funcionen en https://kanarath.github.io/forja-art/
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kanarath.github.io",
  base: "/forja-art",
  trailingSlash: "ignore",
});
