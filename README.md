# FORJA//ART

Academia personal de **Pixel Art** y **Voxel Art**: aprende haciendo piezas reales en Aseprite y MagicaVoxel, y llévalas a Godot.

Web: https://kanarath.github.io/forja-art/

## Estado

Fase 1 · Foundation completada (ver estado en el [roadmap](docs/04-ROADMAP-Y-PLAN-DESARROLLO.md)). Documentos en [`docs/`](docs/):

- [PRD](docs/01-PRD.md)
- [Arquitectura](docs/02-ARQUITECTURA.md)
- [Currículos y plan de contenidos](docs/03-PLAN-CONTENIDOS.md)
- [Roadmap y plan de desarrollo](docs/04-ROADMAP-Y-PLAN-DESARROLLO.md)
- [Registro de decisiones](docs/05-DECISIONES.md)

## Desarrollo local

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev      # http://localhost:4321/forja-art/
npm run build    # genera dist/
npm run preview  # sirve dist/ en local
npm test         # tests: progreso, logros, zip, .vox, sprites, rampas, dithering, luz y contraste WCAG
npm run validate # compila también los borradores y revisa enlaces, alt, accesibilidad y tamaños
npm run check    # test + validate: se ejecuta antes de publicar
npm run deploy   # check + build y sube dist/ a la rama gh-pages (añade -- --drafts para incluir borradores)
```

## Despliegue

El repo **no usa GitHub Actions** (están desactivadas). Se publica desde tu ordenador con `npm run deploy`: pasa los tests y la validación, construye con Astro y sube el resultado a la rama `gh-pages`. En GitHub, Pages está en «Deploy from a branch: `gh-pages` / (root)» y solo sirve esos archivos ya hechos. Si la comprobación falla, no se sube nada.

## Forge Tools

Herramientas gratuitas en [`forge-tools/`](forge-tools/README.md): scripts de Aseprite y la CLI `forja-vox` para `.vox`. La web las ofrece en la página Forge Tools.

## Añadir una lección

1. Crea `src/content/lessons/<pixel|voxel|fundamentos>/<id>-<nombre>.mdx`.
2. Rellena el frontmatter (el esquema está en [`src/content.config.ts`](src/content.config.ts)); copia una lección existente como plantilla.
3. Empieza con `status: borrador`: solo se ve en local (`npm run dev`).
4. `revisada` la muestra también en la web con la etiqueta «En prueba»; `publicada` exige `review.examplesChecked` y `review.testedByLearner`.

Si algo del frontmatter está mal (un campo, un prerrequisito inexistente, la XP mal repartida…), `npm run build` falla y te dice qué y dónde.

### Componentes disponibles en las lecciones

No hace falta importarlos en el `.mdx`:

| Componente | Para qué |
|---|---|
| `<Block kind="pieza\|concepto\|guiada\|version\|errores\|calidad">` | Los 6 bloques fijos de una lección |
| `<Step n={1} title="…">` | Un paso de la forja guiada |
| `<Keys k="Ctrl+N" />` | Atajo de teclado |
| `<Why>`, `<Tip>`, `<Warn>` | Notas: por qué, truco, cuidado |
| `<ToolNote tool="pixelorama">` | Equivalencia en otro programa |
| `<Sprite name="gem" view="normal\|silhouette\|gray\|smooth" />` | Sprite real del registro `src/data/sprites.ts` |
| `<Mistake title="…">` con `slot="wrong"` y `slot="right"` | Comparativa error / corrección |
| `<Checklist items={[…]} />` | Comprobación de la pieza |
| `<Quiz q="…" options={[…]} answer={n}>` | Pregunta con explicación |

## Sprites de ejemplo

Los sprites didácticos son **datos**, no imágenes: `art-src/sprites/<nombre>.sprite.json`.

```json
{
  "name": "gem",
  "description": "Gema facetada de 9×7…",
  "license": "CC0 · creado como datos para FORJA//ART",
  "tags": ["prop"],
  "palette": { "1": "#1b1030", "3": "#ff4fa3" },
  "rows": ["..11111..", ".1333331."]
}
```

- `.` es transparente; cada otro carácter es una clave de `palette`; todas las filas miden lo mismo.
- `npm run sprites` valida todos y genera `public/assets/sprites/<nombre>.png` y `<nombre>@8x.png` (se ejecuta solo antes de `dev` y `build`; los PNG no se suben al repo).
- En una lección: `<Sprite name="gem" />`.

## Progreso y XP

- Se guarda **solo en tu navegador** (`localStorage`, clave `forja-art:progress`): qué partes de cada lección has completado y tus marcas del checklist.
- XP, rangos, porcentajes y «siguiente lección» se **calculan** a partir de eso (`src/lib/game/core.ts`), con los rangos de `src/data/ranks.ts` y la ruta de `src/data/route.ts`.
- `npm test` ejecuta los tests de esa lógica.

## Portfolio y copia de seguridad

- Tus piezas e imágenes se guardan **solo en este navegador** (IndexedDB, base de datos `forja-art`).
- Cada pieza puede tener varias versiones; el detalle incluye un comparador antes/después.
- Registrar una pieza asociada a una lección completa la parte «pieza» de esa lección (y su XP). Si la borras, la pierdes.
- **Exportar copia** descarga un `.zip` (portfolio + imágenes + progreso). **Importar copia** lo restaura, sustituyendo lo actual. El zip se escribe sin dependencias (`src/lib/zip.ts`) y se abre con cualquier descompresor.

## Logros y encargos

- **Logros** en `src/data/achievements.ts`. Sin `rules`, los desbloquea la pieza de la lección que los declara (`achievements: [id]` en su frontmatter; el build comprueba que exista). Con `rules`, se desbloquean cuando se cumplen todas (piezas, versiones, lecciones o encargos).
- **Encargos** en `src/content/commissions/*.md`: proyectos libres con brief, restricciones, nº de piezas y XP. Se completan registrando piezas asociadas al encargo desde el portfolio.

## Créditos

Licencias del arte, las tipografías y el software en [`CREDITS.md`](CREDITS.md).
