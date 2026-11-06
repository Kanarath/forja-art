# FORJA//ART

Academia personal de **Pixel Art** y **Voxel Art**: aprende haciendo piezas reales en Aseprite y MagicaVoxel, y llévalas a Godot.

Web: https://kanarath.github.io/forja-art/

## Estado

Fase 1 · Foundation. Ver [`docs/`](docs/):

- [PRD](docs/01-PRD.md)
- [Arquitectura](docs/02-ARQUITECTURA.md)
- [Currículos y plan de contenidos](docs/03-PLAN-CONTENIDOS.md)
- [Roadmap y plan de desarrollo](docs/04-ROADMAP-Y-PLAN-DESARROLLO.md)

## Desarrollo local

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev      # http://localhost:4321/forja-art/
npm run build    # genera dist/
npm run preview  # sirve dist/ en local
```

## Despliegue

Cada push a `main` ejecuta [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): construye con Astro y publica en GitHub Pages.

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
