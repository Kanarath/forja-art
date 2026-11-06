# FORJA//ART — Arquitectura

> Borrador v1 — pendiente de aprobación.

## 1. Decisión de stack y por qué

| Pieza | Elección | Por qué | Alternativa descartada |
|---|---|---|---|
| Framework | **Astro 5 + TypeScript** | Sitio de contenido: genera **HTML estático** por lección; las lecciones son archivos **MDX** separados de la interfaz; JS solo donde hay interactividad ("islands") | Vanilla (contenido mezclado con el HTML, como en Forja Mecha); React SPA (más pesada, sin ventaja real) |
| Validación de contenido | **Content Collections + Zod** | Cada lección declara sus metadatos y el build **falla** si falta algo (prerrequisito inexistente, XP sin pieza…) | YAML sin validar |
| Interactividad | **Web Components en TypeScript**, sin framework | Ya los usas (`<forja-visor>`), son ligeros y funcionan en MDX | React/Preact: se añade solo si un lab lo justifica |
| Píxel | **Canvas 2D** (`imageSmoothingEnabled = false`) | Suficiente para inspector, rampas y animador | PixiJS (WebGL para miles de sprites: innecesario) |
| Voxel | **three.js** + `VOXLoader` (o un parser `.vox` propio y mínimo) | Carga `.vox` reales; three.js ya lo conoces | Babylon.js |
| Progreso / XP | **localStorage** (JSON pequeño, versionado) | Síncrono y simple | — |
| Portfolio | **IndexedDB** (envoltorio mínimo propio o `idb-keyval`, ~1 KB) | Guarda imágenes (Blob) sin el límite de unos 5 MB de localStorage | Subir al repo (descartado: lo quieres privado) |
| Copia de seguridad | Exportar/importar `.zip` (`fflate`, ~8 KB) | No perder el portfolio si se borra el navegador | — |
| Deploy | **GitHub Actions** → GitHub Pages (`withastro/action`) | Build + publicación automática en cada push a `main` | Publicar la rama directamente (no hay build) |
| Tests | Vitest (lógica: XP, almacenamiento, parsers) + validador de contenido | Barato y útil | E2E pesado (más adelante, si hace falta) |

**Dependencias de ejecución previstas:** `three`, `fflate`. Nada más.

## 2. Estructura del repositorio

```
forja-art/
├─ .github/workflows/deploy.yml     build + deploy a Pages
├─ astro.config.mjs                 site: kanarath.github.io, base: /forja-art
├─ src/
│  ├─ content.config.ts             esquemas Zod de todas las colecciones
│  ├─ content/
│  │  ├─ disciplines/               pixel.yaml, voxel.yaml, fundamentos.yaml  ← registro extensible
│  │  ├─ lessons/
│  │  │  ├─ pixel/p0-01-taller.mdx …
│  │  │  └─ voxel/v0-01-taller.mdx …
│  │  ├─ fundamentals/f01-valor.mdx …
│  │  ├─ commissions/               encargos (proyectos libres)
│  │  ├─ achievements.yaml          logros
│  │  ├─ ranks.yaml                 rangos por disciplina
│  │  └─ shortcuts/                 aseprite.yaml, magicavoxel.yaml, pixelorama.yaml
│  ├─ components/
│  │  ├─ lesson/                    <Piece> <Concept> <Step> <Why> <Keys> <Mistake> <Compare> <Checklist> <Quiz> <ToolNote tool="pixelorama">
│  │  ├─ ui/                        tarjetas, barras, badges, mapa de ruta
│  │  └─ art/                       <Sprite> <SpriteCompare> <VoxModel> (renderizan assets reales)
│  ├─ islands/                      web components interactivos (se cargan bajo demanda)
│  │  ├─ sprite-inspector.ts
│  │  ├─ ramp-lab.ts
│  │  ├─ mini-animator.ts
│  │  └─ vox-viewer.ts
│  ├─ lib/
│  │  ├─ store/progress.ts          progreso + XP (localStorage, con versión y migraciones)
│  │  ├─ store/portfolio.ts         IndexedDB
│  │  ├─ store/backup.ts            export/import zip
│  │  ├─ game/xp.ts, ranks.ts, achievements.ts
│  │  ├─ pixel/                     sprite data → canvas, análisis (huérfanos, clusters, jaggies)
│  │  └─ voxel/vox-parser.ts
│  ├─ layouts/                      BaseLayout, DisciplineLayout, LessonLayout
│  ├─ styles/tokens.css             tokens + temas por disciplina ([data-discipline])
│  └─ pages/                        index, pixel/, voxel/, fundamentos/, labs/, portfolio/, logros/, referencia/
├─ public/assets/
│  ├─ sprites/                      PNG indexados generados (+ .json de datos)
│  ├─ vox/                          modelos .vox por etapa
│  └─ img/                          renders de MagicaVoxel (webp), diagramas svg
├─ art-src/                         FUENTES de los ejemplos (verificables)
│  ├─ sprites/*.sprite.json         paleta + filas de índices (texto legible y versionable)
│  └─ vox/*.vox                     modelos fuente
├─ tools/                           scripts Node del pipeline
│  ├─ build-sprites.ts              art-src → PNG + metadatos
│  ├─ validate-content.ts           checklist de calidad automatizable
│  └─ check-assets.ts               presupuestos de tamaño
├─ docs/                            PRD, arquitectura, roadmap, contenidos, decisiones (ADR)
└─ CREDITS.md                       atribuciones y licencias de referencias externas
```

## 3. Contenido desacoplado: el esquema de una lección

```yaml
# frontmatter de src/content/lessons/pixel/p1-01-silueta.mdx
id: p1-01
discipline: pixel            # referencia a disciplines/
level: 1
order: 1
title: "Silueta: una espada que se lee a 16×16"
duration: 40                 # minutos
status: borrador             # borrador | revisada | publicada  (solo «publicada» sale en producción)
prerequisites: [p0-01]
fundamentals: [f02-silueta]
objectives: ["…", "…"]
tools: [aseprite]
shortcuts: [aseprite.pencil, aseprite.eraser, aseprite.grid]
piece: { name: "Espada legible", canvas: "16x16" }
xp: { concept: 10, guided: 20, piece: 60 }
achievements: [primera-silueta]
review: { pixelPerfectChecked: false, shortcutsVerifiedIn: "1.3.x", testedByLearner: false }
```

Añadir una lección = **crear un archivo `.mdx`**. Añadir una especialidad nueva (p. ej. *Low Poly Forge*) = un `.yaml` en `disciplines/` + su carpeta de lecciones + un tema de color.

## 4. Assets: verificables y ligeros

- **Sprites didácticos**: fuente en `art-src/sprites/*.sprite.json`
  ```json
  { "palette": ["#00000000", "#1b1b2f", "#6b3d2e", "#e0a060"], "rows": ["0011000…", "…"] }
  ```
  `tools/build-sprites.ts` genera PNG indexado. La web los dibuja con nearest-neighbor y el inspector lee los **datos reales**. Ocupan bytes.
- **Voxel**: `.vox` reales (normalmente < 50 KB). Una etapa = un archivo (`cofre_01.vox … cofre_05.vox`), igual que el visor por pasos de Forja Mecha.
- **Renders** de MagicaVoxel en **WebP** (≤ 200 KB cada uno), con `loading="lazy"`.
- **Presupuestos** que comprueba `check-assets.ts` en CI: imagen ≤ 300 KB, `.vox` ≤ 200 KB, página de lección ≤ 1,5 MB en total.
- Nada de `.blend` ni `.aseprite` pesados en el repo. Si hacen falta como descarga: GitHub Releases.

## 5. Datos del usuario

```ts
// localStorage "forja-art:v1"
{ version: 1,
  lessons: { "p1-01": { blocks: { concept: true, guided: true }, pieceId: "pf_123", completedAt: "…" } },
  xp: { pixel: 90, voxel: 40, fundamentos: 10 },
  achievements: { "primera-silueta": "2026-11-20" },
  commissions: { … }, settings: { … } }
```
- La XP se **recalcula** a partir de lecciones y piezas (no se guarda como contador mutable): sin trampas por error y con migraciones sencillas.
- Portfolio en IndexedDB: `pieces` (metadatos) + `images` (Blob, versiones).
- Si el almacenamiento está bloqueado (modo privado), la web sigue funcionando sin guardar, como en Forja Mecha.

## 6. Identidad visual (tokens)

- Base compartida: grafito `#0e0f14`, paneles `#171922`, líneas `#2a2d3a`, texto `#e8e6f0`.
- `[data-discipline="pixel"]`: acento **magenta `#ff4fa3`** + **ámbar `#ffb84d`**; bordes duros de 1 px, sombras escalonadas (sin desenfoque) y tipografía pixel **solo** en titulares.
- `[data-discipline="voxel"]`: acento **cian `#38e1ff`** + **turquesa `#2ec4a6`**; esquinas isométricas y sombras suaves tipo AO.
- `[data-discipline="fundamentos"]`: **oro `#e6c35c`** sobre neutro.
- Tipografía: Chakra Petch (titulares, continuidad con Forja Mecha), Inter (texto), JetBrains Mono (atajos y datos), una fuente pixel con licencia OFL para los rótulos de PIXEL FORGE.
- Las tarjetas de módulo muestran **el sprite o el `.vox` real** de su pieza final.
- Animaciones sutiles: hover que «extruye» la tarjeta en voxel y «escalona» en pixel; se respeta `prefers-reduced-motion`.
- Se validará con 2–3 maquetas del dashboard en la tarea 1.2.

## 7. Despliegue

- `main` → GitHub Action → build Astro → `actions/deploy-pages`.
- Pages configurado con «Source: GitHub Actions».
- El workflow también ejecuta `validate-content` y `check-assets`: **si una lección no pasa, no se despliega**.

## 8. Previsión para Forge Tools (fase 6, no se construye ahora)

- Repositorios aparte (`forja-art-tools`) para no mezclar ciclos de versión y licencias.
- La web solo tendrá una página «Forge Tools — próximamente» y documentación.
- Hallazgos de la investigación preliminar:
  - **Aseprite**: API Lua madura (v41: diálogos, eventos de sprite incluidos `save` y `beforesave`, WebSocket, extensiones `.aseprite-extension`, plugins de formato de archivo desde la 1.3.17). Viable: analizador de huérfanos y clusters, gestor de paletas o rampas, exportador de spritesheets para Godot.
  - **MagicaVoxel**: sin API de plugins; shaders GLSL propios desde su consola (por verificar). Lo viable son **herramientas externas sobre `.vox`** (formato documentado): validador, gestor de paletas, exportador a Godot y renderizador de spritesheets isométricos.
  - **Pixelorama**: extensiones Godot que se rompen entre versiones; **LibreSprite**: scripting JS, proyecto poco activo. Prioridad baja.
- Los analizadores de `src/lib/pixel` y `src/lib/voxel` se escriben como **módulos puros en TypeScript** para poder reutilizarlos en las Forge Tools (CLI en Node) sin reescribirlos.
