# FORJA//ART — PRD (Product Requirements Document)

> Estado: **borrador v1 — pendiente de aprobación**. Fecha: 2026-11-06.
> Fase actual: PHASE 0 — DISCOVERY (sin código).

## 1. Visión

Una **academia personal de arte digital**, visual, práctica y gamificada, para aprender **Pixel Art** y **Voxel Art** desde un nivel de «he trasteado» hasta poder crear assets de videojuego, personajes, escenarios, ilustraciones y dioramas de calidad.

FORJA//ART actúa como **profesor particular**: explica qué haces, por qué lo haces, qué principio artístico interviene y cómo corregir los errores. A largo plazo será también un pequeño ecosistema de **herramientas gratuitas** (Forge Tools).

## 2. Alumno (perfil confirmado en la entrevista)

| Aspecto | Decisión |
|---|---|
| Nivel actual | Ha trasteado con Aseprite / MagicaVoxel sin método |
| Tiempo | **2–4 h/semana** → lecciones de **30–45 min**, retos cortos |
| Disciplinas | **Ambas desde el principio**, con contenido suficiente en cada una |
| Estilos pixel | JRPG 16-bit · indie moderno · ilustración detallada |
| Estilos voxel | Dioramas isométricos · props de juego · personajes chibi · arquitectura |
| Motor destino | **Godot** |
| Experiencia previa | Blender hard surface (Forja Mecha) |
| SO | Windows 11 |

## 3. Principios del producto

1. **Cada lección termina con una pieza real** hecha en el programa real (sprite, modelo, escena, animación).
2. **Enseñar con imágenes y ejercicios antes que con texto.** Explicaciones breves, siempre con el «¿por qué?».
3. **Contenido verificable**: todo ejemplo es inspeccionable (píxel a píxel o vóxel a vóxel). Nada de ilustraciones pixeladas ni modelos voxelizados como ejemplo de técnica.
4. **Diez lecciones excelentes antes que cincuenta superficiales.** Ninguna lección se publica sin pasar la revisión de calidad.
5. **Gratis por defecto**: el alumno nunca está obligado a pagar software (Aseprite se puede compilar gratis; Pixelorama como alternativa documentada).
6. **La gamificación premia habilidades reales**, no clics.
7. **Sin backend.** Todo funciona en GitHub Pages; los datos personales viven en el navegador con copia exportable.

## 4. Alcance

### 4.1 Áreas

- **Dashboard (Taller)**: progreso global, siguiente lección recomendada, misión activa, últimas piezas del portfolio.
- **PIXEL FORGE** y **VOXEL FORGE**: cada una con dashboard, mapa de aprendizaje, módulos, lecciones, retos, galería y logros propios.
- **FUNDAMENTOS**: tronco común de teoría del arte, con práctica en ambas disciplinas («justo a tiempo», enlazada desde las lecciones que la necesitan).
- **LABS**: laboratorios educativos interactivos.
- **PORTFOLIO**: piezas propias, versiones y evolución.
- **LOGROS / RANGOS**: progresión compartida.
- **REFERENCIA**: atajos (Aseprite / MagicaVoxel), glosario, herramientas.
- **FORGE TOOLS** *(fase 6, aplazada)*: solo aparece en la arquitectura y la documentación.

### 4.2 Estructura de una lección (6 bloques fijos)

La estructura de 10 pasos del brief se agrupa en 6 bloques visibles para no alargar lecciones de 30–45 min:

| Bloque | Incluye (pasos del brief) |
|---|---|
| 1. **La pieza** | Introducción + objetivos + resultado final (1, 2) |
| 2. **El concepto** | Teoría breve y visual + demostración interactiva (3, 4) |
| 3. **Forja guiada** | Paso a paso en el programa real, con atajos y notas «¿por qué?» (5, 6) |
| 4. **Tu versión** | Aplicación independiente + reto creativo con variantes (7, 8) |
| 5. **Errores típicos** | Comparativas correcto/incorrecto inspeccionables (9) |
| 6. **Control de calidad** | Autoevaluación (checklist + mini-quiz visual) y registro en el portfolio (10) |

### 4.3 Laboratorios del MVP (confirmados)

1. **Inspector de sprites**: zoom, rejilla, índice de color al pasar el ratón, resaltado de píxeles huérfanos, clusters y jaggies, vista en silueta y en escala de grises. Permite cargar tus PNG.
2. **Paletas y rampas**: construir rampas con hue shifting, ver contraste en grises y aplicarlas en vivo sobre un sprite de ejemplo; exportar a `.gpl` / `.hex` (importables en Aseprite).
3. **Mini-animador**: pocos frames (≤ 8) a baja resolución, onion skinning, duración por frame y reproducción en bucle. **No** es un editor completo.
4. **Visor voxel por etapas**: modelos `.vox` reales de cada paso, girar/zoom, corte por capas (slice), vista solo-silueta y vista de paleta.

Lo que **no** se construye: editores completos de pixel o voxel. El trabajo serio se hace en Aseprite y MagicaVoxel.

### 4.4 Gamificación (moderada)

- **XP** por bloque completado; la mayor parte de la XP (≥ 60 %) solo se obtiene al **registrar la pieza** en el portfolio.
- **Rangos por disciplina** (p. ej. Pixel: *Aprendiz → Oficial → Artesano → Maestro píxel*; Voxel: *Aprendiz → Cantero → Constructor → Arquitecto*) y un **rango global de la Forja**.
- **Logros de habilidad** ligados a piezas reales («Primera rampa con hue shifting», «Ciclo de caminar de 4 frames»).
- **Misiones principales** = la ruta. **Misiones secundarias** = variantes de los retos. **Encargos** = proyectos libres, no ligados a una lección («Forja 5 pociones distintas con la misma paleta»).
- Sin rachas, sin penalizaciones, sin bloqueos. **Todas las lecciones abiertas** y una **ruta guiada** que marca la siguiente recomendada y los requisitos previos.

### 4.5 Portfolio

- Campos: nombre, disciplina, imágenes (versiones), descripción, técnicas, herramientas, lecciones relacionadas, fecha, notas.
- **Versiones** de una misma pieza con comparador antes/después y línea temporal de evolución.
- Almacenado en **IndexedDB**; **exportar/importar** copia completa (`.zip` con JSON + imágenes). Aviso periódico de «haz copia».
- Privado: nada se sube al repo.

## 5. Calidad del contenido (crítico)

| Tipo de ejemplo | Fuente | Regla |
|---|---|---|
| Sprites didácticos (clusters, rampas, dithering, errores) | Generados como **datos** (paleta + rejilla) por scripts del repo | Inspectables a nivel de píxel; se dibujan con nearest-neighbor |
| Modelos voxel didácticos | Archivos **`.vox` reales** (generados por script o hechos en MagicaVoxel) | Nunca mallas voxelizadas |
| Referencias de alto nivel | Enlaces a artistas o assets **CC0 / licencia compatible** (atribución en `CREDITS.md`) | No se rehospeda arte ajeno sin licencia |
| Tus piezas | Portfolio → pueden sustituir ejemplos de forma voluntaria | Se añaden al repo solo si tú lo decides |
| Diagramas | SVG / Canvas | Explican conceptos, no imitan arte |

Cada lección tiene un estado (`borrador → revisada → publicada`) y una **checklist de revisión** (ver plan de contenidos). Sin imágenes generativas.

## 6. Requisitos no funcionales

- GitHub Pages; despliegue automático al hacer push a `main`.
- Responsive (móvil para leer y repasar; escritorio para practicar).
- Rendimiento: HTML estático, JS solo en las páginas con laboratorios; three.js solo donde hay visor voxel. Presupuesto: < 150 KB de JS en lecciones sin laboratorio.
- Accesibilidad: contraste AA en la interfaz, teclado en los labs, `prefers-reduced-motion`.
- Idioma: español.
- Ninguna credencial en el repo.

## 7. Fuera de alcance (por ahora)

- Editores completos de pixel o voxel en la web.
- Cuentas de usuario, backend o sincronización en la nube.
- Unity (solo Godot en producción).
- Forge Tools (fase 6, requiere tu aprobación expresa).

## 8. Métricas de éxito (personales)

- Completar el MVP en ~4–6 semanas de estudio (2–4 h/semana).
- ≥ 1 pieza en el portfolio por lección completada.
- Al terminar el nivel 3 de cada ruta: un sprite y un prop voxel que tú mismo consideres «para enseñar».

## 9. Decisiones tomadas

| # | Decisión | Elección |
|---|---|---|
| D1 | Disciplinas | Ambas desde el inicio |
| D2 | Software pixel | Aseprite principal + notas Pixelorama |
| D3 | Software voxel | MagicaVoxel principal; Blender opcional en render y producción |
| D4 | Motor | Godot |
| D5 | Interfaz | Oscura tipo taller |
| D6 | Repo | `Kanarath/forja-art`, público → `kanarath.github.io/forja-art/` |
| D7 | Portfolio | Local (IndexedDB) + copia exportable |
| D8 | Gamificación | Moderada |
| D9 | Acceso | Abierto + ruta guiada |
| D10 | Stack | Astro + TypeScript |
| D11 | Ejemplos | Mixto (programados + CC0/enlaces + tus piezas) |
| D12 | Explicaciones de desarrollo | Por tarea |

## 10. Preguntas abiertas (no bloquean la fase 1)

- ¿Compras Aseprite o lo compilamos? (La lección P0 cubre ambos caminos.)
- ¿Tienes tableta gráfica? (El pixel art se hace bien con ratón; afecta solo a consejos.)
- Nombre de los rangos y tono de los textos de gamificación (lo proponemos en la fase 1 con maquetas).
