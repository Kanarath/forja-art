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
