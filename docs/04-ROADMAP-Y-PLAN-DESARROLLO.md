# FORJA//ART — Roadmap y plan de desarrollo

> Borrador v1. Cada tarea sigue el ciclo: **explicar qué y por qué → implementar → comprobar → resumir 3–5 puntos clave → cómo probarlo tú**.
> Nada se implementa hasta que apruebes este plan.

## Estado (2026-11-06)

**Fase 1 · Foundation: completada**, a falta de la publicación en GitHub Pages: está bloqueada por un bloqueo de facturación de la cuenta de GitHub. Hay un ticket abierto con soporte y el workflow está listo. La revisión visual se hizo junto con la de la fase 2 (ver abajo).

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
- `hidden` anulado por `display: flex` en el portfolio vacío;
- desbordamiento horizontal de los visores 3D en móvil;
- dos comparativas de V1-02 cuya imagen contradecía el texto.

**Fase 4 · Art Labs: completada.** A los 4 labs del MVP se suman el comparador de siluetas, el lab de dithering (5 métodos, a 1× y ampliado) y el lab de luz y sombra (esfera cuantizada en N tonos, con luz rebotada). Los 7 están en /labs/ y disponibles en las lecciones; el comparador de siluetas ya se usa en P1-02 y F02-01.

**Fase 5 · Calidad y pulido: completada.**
- **Rendimiento:**
  - Los visores 3D solo dibujan mientras están en pantalla.
  - three.js pesa 556 KB (136 KB con gzip). Se descarga una vez y la caché lo reutiliza en todas las lecciones de voxel. Importar solo algunas clases no lo reduce, porque WebGLRenderer necesita casi toda la librería.
- **Accesibilidad:**
  - Test de contraste WCAG de los colores del diseño (13 pares, todos ≥ 4,5:1).
  - El validador comprueba el idioma, que haya un único h1, los saltos de título y el nombre accesible de botones, enlaces y campos.
  - Corregido: dos h1 en el Taller y dos campos sin etiqueta en el portfolio.
  - El inspector se usa con teclado: foco en el lienzo y flechas, y anuncia cada píxel.
- **Visual:**
  - Damero más claro (tokens --checker-a/b), para que se lean los contornos oscuros.
  - Distancia mínima de la cámara en modelos pequeños.
- **Página 404 propia y CREDITS.md** con las licencias.

**Contenido · segundo bloque: 7 lecciones más (16 en total).**
- **Pixel nivel 2:** P2-02 Clusters y huérfanos, P2-03 Contornos y AA selectivo.
- **Pixel nivel 3:** P3-01 Luz y pillow shading, P3-02 Rampas con hue shifting, P3-03 Dithering.
- **Voxel nivel 2:** V2-01 Blockout y proporción, V2-02 Escalonado y detalle por capas.
- **Arte nuevo:** 6 sprites (bola con luz frente a pillow, seta con selout y sin contorno, disco sin y con AA) y el modelo «torre» por etapas.
- **Ruta y logros:** 6 logros nuevos y la ruta guiada ampliada.
- **Estado:** todas en borrador, pendientes de tu prueba.

**Contenido · tercer bloque: 7 lecciones más (23 en total).**
- **Pixel nivel 4:** P4-01 Materiales, P4-02 Set de iconos, P4-03 Microanimación.
- **Voxel nivel 3:** V3-01 Paleta y rampas en 3D, V3-02 Materiales de render.
- **Fundamentos:** F03-01 Color, F05-01 Luz y sombra.
- **Arte nuevo:** 4 sprites de materiales (metal, mate, cristal con alfa y madera) y los modelos «roca» y «farol».
- **Logros:** 7 nuevos.
- **Pendiente:** un set de iconos de ejemplo realmente coherente para P4-02. La lección hoy audita las incoherencias de los sprites del curso.

**Contenido · cuarto bloque: 7 lecciones más (30 en total).**
- **Pixel nivel 5:** P5-01 Proporciones chibi, P5-02 Expresiones, P5-03 Criaturas y enemigos.
- **Voxel nivel 4:** V4-01 Kit del herrero, V4-02 Armas voxel.
- **Fundamentos:** F04-01 Paletas y armonías, F09-01 Diseño de personajes.
- **Arte nuevo:** héroe chibi frente a realista (16×24), 5 expresiones sobre la misma cabeza y un murciélago; modelos voxel «kit-herrero», «espada» y «chibi».
- **Corregido durante la revisión:** la etapa final de la espada perdía las puntas de la guarda, y la sonrisa de face-alegre tocaba el ojo.

**Contenido · quinto bloque: 7 lecciones más (37 en total).**
- **Pixel:** P6-01 Frames y timing (idle), P6-02 Ciclo de caminar, P7-01 Tiles sin costuras.
- **Voxel:** V5-01 Personajes y criaturas (forma y pose), V6-01 Arquitectura modular.
- **Fundamentos:** F07-01 Composición, F08-01 Perspectivas.
- **Arte nuevo:**
  - frames del héroe (respirar, parpadear y dos pasos);
  - tiles de hierba (bueno, con bisel y con patrón);
  - la misma caja en lateral, 3/4 e isométrica;
  - dos escenas de 64×40 compuestas con sprites del curso;
  - modelos «chibi-pose», «slime-voxel» y «casa-modular».
- **Componentes:**
  - `<Sprite tile={3}>` repite un tile;
  - `<Animator sprites={[…]}>` anima sprites del curso;
  - PixelSprite dibuja un `<path>` por color en vez de un `<rect>` por píxel: las páginas con escenas pasaron de 1,6 MB a menos de 70 KB.
- **Corregido durante la revisión:**
  - **El visor 3D mostraba los modelos en espejo** respecto a MagicaVoxel: el cambio de Z-arriba a Y-arriba invertía la mano del sistema de ejes. Ahora invierte Y y la cámara mira desde el frente.
  - **El Inspector con subida de imagen desbordaba la página** unos 40–60 px: un canvas vacío mide 300 px y el campo de archivo no encogía.
  - **Los sprites grandes** se encogen a su columna.

**Contenido · sexto bloque: 6 lecciones más (43 en total).**
- **Pixel:** P6-03 Squash & stretch (el salto del slime), P6-04 VFX (un impacto en cinco frames), P7-02 Agua animada.
- **Voxel:** V7-01 Dioramas, V8-01 Render final.
- **Fundamentos:** F06-01 Materiales.
- **Arte nuevo:**
  - salto del slime en 16×20 (reposo, squash, stretch, punto alto y dos errores: rígido y sin volumen);
  - impacto de 16×16 en 5 frames, del destello al humo;
  - tile de agua en 3 frames sin costuras y un frame «que hierve» como error;
  - la misma esfera en mate, brillante, metal y cristal;
  - modelo «diorama» (base con estratos, casa y árbol del kit, detalles).
- **Componentes:** `<Animator sprites={[…]}>` acepta frames con paletas distintas si no se contradicen (los VFX usan menos colores según el frame).

**Contenido · séptimo bloque: 5 lecciones más (48 en total).**
- **Pixel:** P7-03 Transiciones (la orilla), P8-01 Ilustración (escena con todo lo aprendido), P9-01 Pixel art en Godot.
- **Voxel:** V9-01 De MagicaVoxel a Godot.
- **Fundamentos:** F10-01 Storytelling visual. Con ella, los diez fundamentos (F01–F10) tienen lección.
- **Arte nuevo:**
  - mapa de orilla de 80×48, con y sin transición, y sus tiles de borde, esquina y esquina interior (calculados por distancia a la hierba);
  - cofre abierto, slime derrotado y espada en el suelo, más dos escenas: sin historia y con historia;
  - escena final de 80×48 con orilla, personajes, impacto y props;
  - spritesheet de 64×24 del ciclo de caminar, para importarlo en Godot.

**Contenido · octavo bloque: 5 lecciones más (53 en total).**
- **Pixel:** P4-04 Interfaz (panel 9-slice y barra de vida), P5-04 Palette swap, P8-02 Luz de escena (día, atardecer y noche).
- **Voxel:** V4-03 Hard surface (un carro), V6-02 Terreno (terrazas, estratos y agua).
- **Arte nuevo:**
  - panel de 24×24 ampliado con 9-slice frente a estirado, y barra de vida llena y baja;
  - tres variantes del slime por cambio de paleta y una que se aplana en grises;
  - la escena final recoloreada por fórmula: atardecer, noche (la luz conserva su color) y una «noche» que solo oscurece;
  - modelos «terreno» (mapa de alturas en terrazas) y «carro» (blockout, paneles y herrajes).
- **Ruta:** las lecciones nuevas se intercalan junto a las de su nivel, no al final.

**Contenido · noveno bloque: 5 lecciones más (58 en total).**
- **Pixel:** P2-04 Tipografía pixel (una fuente de 3×5), P6-05 Smears (el tajo de la espada).
- **Voxel:** V2-03 Formas orgánicas, V5-02 Del voxel al sprite (renders como frames), V7-02 Interiores (una habitación en corte).
- **Arte nuevo:**
  - fuente de 3×5 con letras y números, un texto con sombra y otro con espaciado roto;
  - tajo en tres frames (arranque, smear y estela) y su versión de línea fina;
  - modelos «arbol-organico», «habitacion» y «slime-salto» (cuatro etapas sobre el mismo disco, para renderizarlas como frames).

**Contenido · décimo bloque: 5 lecciones más (63 en total).**
- **Pixel:** P5-05 Retratos (un busto de 32×32), P6-06 Recibir daño (flash, retroceso y parpadeo), P8-03 Fondos con parallax.
- **Voxel:** V3-03 Desgaste (un prop con historia), V5-03 Criaturas voxel (un murciélago con alas finas).
- **Arte nuevo:**
  - retrato de 32×32 en masas planas, terminado y con pillow shading como error;
  - animación de daño del slime en cinco frames y el flash del héroe (blanco y, como error, rojo oscuro);
  - fondo de tres capas con parallax en 16 frames, la capa lejana sola y la versión plana como error;
  - modelos «cofre-viejo» (limpio, gastado y con historia) y «murcielago».

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
