# FORJA//ART — Roadmap y plan de desarrollo

> Borrador v1. Cada tarea sigue el ciclo: **explicar qué y por qué → implementar → comprobar → resumir 3–5 puntos clave → cómo probarlo tú**.
> Nada se implementa hasta que apruebes este plan.

## Estado (2026-11-06)

**Fase 1 · Foundation: completada en código**, a falta de dos cosas:
- **Publicación en GitHub Pages:** bloqueada por un bloqueo de facturación de la cuenta de GitHub. Hay un ticket abierto con soporte y el workflow está listo.
- **Revisión visual de las pantallas con progreso, portfolio y logros:** pendiente. Están verificadas funcionalmente en el navegador.

| Tarea | Estado | Commit |
|---|---|---|
| 1.1 Repo + esqueleto + deploy | ✅ (deploy bloqueado por GitHub) | `70f526c` |
| 1.2 Identidad visual y maquetas | ✅ Elegida A + toques de B (D13) | `52d5844` |
| 1.3 Layouts y navegación | ✅ | `6d85b94` |
| 1.4 Esquema de contenido | ✅ (D14) | `756c69b` |
| 1.5 Componentes de lección | ✅ | `4590b30` |
| 1.6 Pipeline de sprites | ✅ | `67e7677` |
| 1.7 Progreso y XP | ✅ | `b2aabfe` |
| 1.8 Portfolio y copia de seguridad | ✅ | `42ebe86` |
| 1.9 Logros y encargos | ✅ | `75d4d5e` |
| 1.10 Validación en CI | ✅ | este commit |

**Fase 2+3 · MVP de contenido: escrita (tareas 2.1–2.8); falta la 2.9, que es tuya.**

| Tarea | Estado |
|---|---|
| 2.1 Inspector de sprites + P0-01 | ✅ Lab hecho; P0-01 pulida con el inspector |
| 2.2 Visor voxel + V0-01 | ✅ Formato .vox propio, 6 modelos y 18 .vox por etapas |
| 2.3 F01 + Paletas y rampas | ✅ |
| 2.4 P1-01 y V1-01 | ✅ |
| 2.5 F02 | ✅ |
| 2.6 P1-02 y V1-02 | ✅ |
| 2.7 P2-01 + mini-animador | ✅ |
| 2.8 Revisión de calidad | ✅ Las 9 compilan y pasan la validación; atajos de MagicaVoxel sin inventar, con aviso «Verifica en tu versión» |
| 2.9 Prueba del alumno | ⏳ Tú: probar cada lección en Aseprite o MagicaVoxel, verificar menús y atajos, y pasar `status` a `revisada` |

**Revisión visual (hecha):** Taller, dashboards, Logros, Labs, lecciones y portfolio, en escritorio y móvil. Los 9 visores de V1-02 arrancan sin errores de WebGL. Corregido:
- contraste del chip de fundamento activo;
- nombre de la pieza de P0-01;
- zoom automático del inspector;
- cámara del visor (ahora se ve el frente de los modelos);
- solapamiento del animador;
-  anulado por  en el portfolio vacío;
- desbordamiento horizontal de los visores 3D en móvil;
- dos comparativas de V1-02 cuya imagen contradecía el texto.

**Lecciones aprendidas durante la fase 1:**
- **`BASE_URL` sin barra final.** Astro 7 da `BASE_URL` sin barra final, así que hay que usar siempre `src/lib/url.ts`. El validador detecta enlaces sin la base.
- **Colecciones nuevas en local.** El servidor de desarrollo no ve colecciones de contenido nuevas: hay que reiniciarlo (`npx astro dev --force`).
- **Borradores.** El build normal no compila los borradores: por eso existe `npm run validate`.
- **`npm ci` en Windows.** Falla si `npm run dev` está abierto, porque bloquea archivos de `node_modules`.

## Roadmap

| Fase | Objetivo | Resultado visible |
|---|---|---|
| **0 · Discovery** ✅ | Análisis, entrevista, PRD, arquitectura, currículos | Estos documentos |
| **1 · Foundation** | Repo, deploy, identidad visual, navegación, dashboards, progreso, portfolio | Web publicada con las dos forjas «vacías» pero navegables |
| **2+3 · Academias (en paralelo)** | MVP de contenido: 9 lecciones + 2 encargos (ver plan de contenidos) | Primeras lecciones completas en ambas rutas |
| **4 · Art Labs** | Ampliar los 4 labs del MVP y añadir comparador de siluetas, laboratorio de dithering, luz y contraste | Página LABS |
| **5 · Quality & polish** | Revisión de contenido, accesibilidad, rendimiento, responsive, documentación | Versión 1.0 |
| **6 · Forge Tools** ⏸ | **Solo con tu aprobación expresa** | Repo aparte `forja-art-tools` |

Fases 2 y 3 se fusionan porque elegiste ambas disciplinas desde el principio. Los labs del MVP se construyen **dentro** de las fases 1 y 2, justo cuando la primera lección los necesita.

## Plan de desarrollo — Fase 1 (Foundation)

| # | Tarea | Qué aprendes | Hecho cuando… |
|---|---|---|---|
| 1.1 | **Repo + esqueleto Astro + deploy**: crear `Kanarath/forja-art` (público), Astro + TS, workflow de Actions, Pages con «Source: GitHub Actions» | Cómo funciona un build estático y un pipeline de CI | `kanarath.github.io/forja-art/` muestra una página y se redespliega sola al hacer push |
| 1.2 | **Identidad visual**: tokens, tipografías y 2–3 maquetas del dashboard para elegir | Design tokens y temas con variables CSS | Eliges una maqueta |
| 1.3 | **Layouts y navegación**: Taller, PIXEL FORGE, VOXEL FORGE, Fundamentos y cambio rápido de disciplina | Layouts anidados de Astro | Navegas por todas las áreas en móvil y escritorio |
| 1.4 | **Esquema de contenido**: colecciones, Zod, `disciplines/` y una lección de prueba | Separar contenido de interfaz | Una lección en MDX se renderiza y el build falla si el frontmatter está mal |
| 1.5 | **Componentes de lección**: los 6 bloques, `<Step>`, `<Why>`, `<Keys>`, `<Mistake>`, `<Compare>`, `<Checklist>`, `<Quiz>`, `<ToolNote>` | Componentes reutilizables | La lección de prueba usa todos |
| 1.6 | **Pipeline de sprites**: `art-src/*.sprite.json` → PNG + componente `<Sprite>` nítido | Datos de píxel y Canvas 2D | Un sprite se ve nítido a cualquier zoom |
| 1.7 | **Progreso y XP**: store en localStorage, cálculo de XP, rangos y mapa de ruta con «siguiente recomendada» | Estado derivado vs. estado guardado | Marcar bloques actualiza la XP y el mapa |
| 1.8 | **Portfolio**: IndexedDB, alta de pieza, versiones, comparador antes/después, exportar/importar zip | IndexedDB, Blobs, copias de seguridad | Creas una pieza con 2 versiones, exportas, borras e importas sin perder nada |
| 1.9 | **Logros y encargos**: `achievements.yaml`, desbloqueo ligado a piezas | Reglas declarativas | Un logro se desbloquea solo al registrar su pieza |
| 1.10 | **Validación en CI**: `validate-content`, `check-assets`, tests de la lógica | Calidad automatizada | Un PR con una lección rota no despliega |

## Plan — Fase 2+3 (MVP de contenido)

| # | Tarea |
|---|---|
| 2.1 | **Inspector de sprites** (lab 1) + P0-01 Taller de Aseprite + atajos de Aseprite |
| 2.2 | **Visor voxel por etapas** (lab 4) + V0-01 Taller de MagicaVoxel + atajos de MagicaVoxel |
| 2.3 | F01 Valor y lectura (doble práctica) + **Paletas y rampas** (lab 2, primera versión) |
| 2.4 | P1-01 y V1-01 |
| 2.5 | F02 Silueta y formas |
| 2.6 | P1-02 y V1-02 |
| 2.7 | P2-01 Líneas pixel-perfect + **mini-animador** (lab 3, primera versión para microanimaciones) |
| 2.8 | 2 encargos + revisión de calidad de las 9 lecciones → `revisada` |
| 2.9 | **Tú pruebas cada lección** → `publicada` |

## Reglas de trabajo en el repo

- Rama `main` = producción (despliega). Trabajo en ramas `feat/…` y PR propio para que puedas revisar.
- Commits pequeños, uno por tarea o subtarea.
- No se toca `Kanarath/forja-mecha`.
- Sin credenciales en el código; `gh` usa tu sesión ya autenticada.
- Ninguna operación destructiva (borrar ramas o repos, force-push) sin preguntarte.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Ambas rutas a la vez con 2–4 h/semana → avance lento | MVP pequeño (9 lecciones) y la ruta guiada alterna disciplinas |
| Perder el portfolio al limpiar el navegador | Exportar zip + recordatorio |
| Ejemplos generados con nivel artístico modesto | Se usan solo para conceptos técnicos; inspiración con referencias CC0/enlazadas y, más adelante, tus piezas |
| Atajos que cambian entre versiones | `shortcuts/*.yaml` con versión verificada y revisión en la fase 5 |
| Crecimiento del alcance (labs convertidos en editores) | Cada lab tiene un objetivo didáctico escrito; lo que no lo cumpla, no entra |
