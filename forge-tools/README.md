# Forge Tools

Herramientas gratuitas de FORJA//ART (licencia MIT) para trabajar fuera de la web. Se descargan desde la página **Forge Tools** de la academia (`/forja-art/tools/`), que las prepara con `tools/build-forge.mjs` (parte de `npm run assets`).

| Herramienta | Dónde | Qué hace |
|---|---|---|
| `aseprite/Forja - Revisar huerfanos.lua` | Aseprite · *File → Scripts* | Marca huérfanos (magenta) y sueltos (cian) de la capa activa en una capa `forja-revision`; cuenta clusters de 1–2 px. Mismas reglas que `src/lib/pixel/analyze.mjs`. |
| `aseprite/Forja - Rampa en grises.lua` | Aseprite · *File → Scripts* | Valor (Rec. 709) de los colores seleccionados en la paleta; avisa de pasos de menos de 8 puntos y de rampas que cambian de sentido; crea muestras en color y en grises. |
| `aseprite/Forja - Exportar para Godot.lua` | Aseprite · *File → Scripts* | Exporta la hoja horizontal + JSON junto al `.aseprite` y resume `hframes`, FPS y etiquetas para Godot. |
| `vox/forja-vox.mjs` | Terminal (Node 18+) | CLI para `.vox`: `info`, `check`, `palette` (.gpl/.png/texto), `recolor`, `render` (hoja isométrica 2:1, varios modelos en fila, `--angles 4`, `--outline`). |

- **Sin dependencias:** `forja-vox.mjs` es un solo archivo; los scripts de Aseprite usan solo su API de Lua.
- **Tests:** `tests/forge-vox.test.ts` (entra en `npm test`).
- **Scripts de Aseprite:** escritos para la API de Aseprite 1.3 y **sin probar en Aseprite** desde aquí. Si algo falla en tu versión, anota el mensaje de error.
