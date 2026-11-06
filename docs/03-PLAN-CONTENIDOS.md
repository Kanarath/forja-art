# FORJA//ART — Currículos y plan de contenidos

> Borrador v1. Lecciones de 30–45 min (2–4 h/semana ≈ 3–4 lecciones por semana entre ambas rutas).
> ★ = incluida en el MVP.

## Cambios pedagógicos respecto al brief (y por qué)

1. **Render desde el día 1 (Voxel).** En vez de esperar al nivel 8, cada pieza voxel termina con un render presentable. El nivel 8 queda para iluminación avanzada y presentación.
2. **Animación temprana (Pixel).** Microanimaciones (brillo, parpadeo, *idle* de 2–4 frames) a partir del nivel 4. El nivel de animación completo se adelanta **antes de los tilesets**, porque un héroe JRPG necesita su ciclo de caminar antes de pisar un escenario.
3. **Valor antes que color.** En ambas rutas se trabaja la forma y el valor (1–4 tonos) antes de la paleta completa: es la causa nº 1 de sprites y modelos «planos».
4. **Fundamentos justo a tiempo.** Cada fundamento se estudia cuando una lección lo necesita y tiene **una práctica en pixel y otra en voxel**, con comparación final.
5. **Producción = Godot.** El nivel 9 de ambas rutas acaba con el asset funcionando dentro de Godot.
6. **Proyectos finales conectados.** El final de Pixel (escena JRPG) y el de Voxel (diorama) pueden compartir **mundo y dirección artística**: desarrollas una identidad propia.

---

## FUNDAMENTOS (tronco común)

| # | Fundamento | Práctica Pixel | Práctica Voxel |
|---|---|---|---|
| ★ F01 | **Valor y lectura** (escala de grises, contraste) | Sprite 16×16 con 3 valores | Prop con 3 valores, test de render en B/N |
| ★ F02 | **Silueta y lenguaje de formas** (círculo/cuadrado/triángulo) | 3 siluetas de arma | 3 bloques de silueta de prop |
| F03 | Color: tono, saturación, temperatura | Hue shifting en una rampa | Rampas de material en la paleta de MagicaVoxel |
| F04 | Paletas y armonías | Paleta limitada para 4 iconos | Paleta de diorama coherente |
| F05 | Luz y sombra (fuente, forma, proyectada, rebote, AO) | Sombreado con una sola fuente | Sol, cielo y AO en el render |
| F06 | Materiales (cómo responde cada uno a la luz) | Metal / madera / gema | MATL: metal, vidrio, emisivo |
| F07 | Composición y lectura visual | Encuadre de una escena | Encuadre isométrico de un diorama |
| F08 | Perspectiva: top-down 3/4, lateral, isométrica, ortográfica | Tile en 3/4 | Cámara ortográfica |
| F09 | Diseño de personajes | Héroe chibi 16×24 | Personaje chibi voxel |
| F10 | Storytelling ambiental y dirección artística | Escena que cuenta algo | Diorama con historia |

---

## PIXEL FORGE (Aseprite principal · notas para Pixelorama)

| Nivel | Contenido | Pieza que forjas |
|---|---|---|
| **0 · El taller** | ★ P0-01 Instalar (comprar o compilar gratis) y configurar Aseprite: rejilla, *pixel-perfect*, atajos clave, exportar ×N | Lienzo plantilla + exportación correcta |
| **1 · Píxel y silueta** | ★ P1-01 Resolución y legibilidad (16×16 vs 32×32) · ★ P1-02 Siluetas de objetos · P1-03 Formas básicas con volumen | Espada y poción legibles a 1× |
| **2 · Líneas y clusters** | ★ P2-01 Líneas pixel-perfect, pendientes 1:1, 1:2, 1:3 y jaggies · P2-02 Curvas limpias · P2-03 Clusters y píxeles huérfanos · P2-04 Contornos (selout) y antialiasing selectivo | Escudo redondo limpio |
| **3 · Valor, rampas y shading** | P3-01 Fuente de luz y *pillow shading* (error) · P3-02 Rampas con hue shifting · P3-03 Contraste · P3-04 Dithering (cuándo sí y cuándo no) | Gema y casco sombreados |
| **4 · Props y materiales** | Metal, madera, piedra, cristal, tela · iconos de inventario · cofre · microanimación de brillo (4 frames) | Set de 8 iconos coherente |
| **5 · Personajes y criaturas** | Proporciones chibi JRPG (16×24, 24×32) · siluetas de clase · expresiones · slime y enemigos · paleta de personaje | Héroe y 2 enemigos |
| **6 · Animación** | Frames y timing · idle · ciclo de caminar en 4 direcciones · anticipación, *squash & stretch*, *smear* · VFX (impacto, fuego) · onion skin en Aseprite | Héroe que camina + ataque |
| **7 · Tilesets y escenarios** | Tiles 16×16, costuras · terrenos y transiciones (terrain sets de Godot) · agua animada · arquitectura modular · vegetación | Tileset de pueblo/bosque |
| **8 · Ilustración y composición** | Perspectiva en pixel · capas de profundidad y parallax · iluminación ambiental (indie moderno) · ilustración detallada | Ilustración de escena 320×180 |
| **9 · Producción en Godot** | Spritesheets y metadatos · import *pixel-perfect* (filtro Nearest, escalado entero) · AnimatedSprite2D · TileMapLayer · organización | Personaje y tileset funcionando en Godot |
| **10 · Proyecto final** | Mini escena JRPG jugable: héroe animado, enemigo, tileset, props, paleta coherente | Escena publicada en tu portfolio |

---

## VOXEL FORGE (MagicaVoxel principal · Blender opcional)

| Nivel | Contenido | Pieza que forjas |
|---|---|---|
| **0 · El taller** | ★ V0-01 Instalar MagicaVoxel, interfaz, cámara y modos (Attach / Erase / Paint) y pinceles (Voxel, Face, Box, Line, Center), paleta, guardar · **primer render** | Escena plantilla + primer render |
| **1 · Pensar en vóxels** | ★ V1-01 Rejilla 3D, escala y resolución (8³, 16³, 32³) · ★ V1-02 Primitivas, simetría (mirror) y operaciones · V1-03 Seleccionar, mover, rotar y duplicar | Barril y caja de madera |
| **2 · Forma y silueta** | Blockout · proporciones · escalonado y «chaflanes» voxel · detalle por capas (grande → pequeño) | Cofre con tapa |
| **3 · Color y materiales** | Paleta y rampas 3D · AO pintado vs AO de render · madera, metal, piedra, agua, vegetación · MATL (metal, vidrio, emisivo) | Farol y set de materiales |
| **4 · Props** | Armas, herramientas, mobiliario · colección temática coherente (misma escala y paleta) | Kit de taller de herrero (5 props) |
| **5 · Personajes y criaturas** | Proporciones chibi · cabeza y expresiones · criaturas fantásticas · pose básica | Personaje chibi + criatura |
| **6 · Arquitectura y naturaleza** | Piezas modulares en rejilla · edificios · árboles, rocas, terreno · ruinas | Casa modular + árboles |
| **7 · Dioramas** | Composición isométrica · base y recorte · profundidad y capas · storytelling · cámara ortográfica | Primer diorama pequeño |
| **8 · Render y presentación** | Luz (sol, cielo, áreas) · AO, sombras, DOF, bloom · materiales en render · presentación para portfolio · (opcional) Blender | Render de portfolio |
| **9 · Producción en Godot** | Exportar (OBJ/PLY → Blender → glTF) · pivotes y escala · optimización de mallas · GridMap / MeshLibrary | Kit modular funcionando en Godot |
| **10 · Proyecto final** | Diorama completo con assets propios | Diorama publicado en tu portfolio |

---

## MVP de contenido (≈ 9 lecciones ≈ 6 h de estudio)

| Orden recomendado | Lección | Ruta |
|---|---|---|
| 1 | P0-01 El taller de Aseprite | Pixel |
| 2 | V0-01 El taller de MagicaVoxel + primer render | Voxel |
| 3 | F01 Valor y lectura (práctica doble) | Fundamentos |
| 4 | P1-01 Resolución y legibilidad | Pixel |
| 5 | V1-01 Rejilla 3D, escala y resolución | Voxel |
| 6 | F02 Silueta y formas (práctica doble) | Fundamentos |
| 7 | P1-02 Siluetas de objetos | Pixel |
| 8 | V1-02 Primitivas, simetría y operaciones | Voxel |
| 9 | P2-01 Líneas pixel-perfect y jaggies | Pixel |

Más 2 **encargos** libres (uno por disciplina) y los 4 laboratorios del MVP integrados en esas lecciones.

---

## Control de calidad: checklist de revisión de cada lección

Automatizable (CI, `validate-content`):
- [ ] Frontmatter completo y prerrequisitos existentes.
- [ ] Los 6 bloques presentes.
- [ ] Cada imagen o asset existe, tiene `alt` y cumple el presupuesto de tamaño.
- [ ] Todo sprite didáctico procede de `art-src/` (datos), no de un PNG sin fuente.
- [ ] Todo atajo citado existe en `shortcuts/*.yaml`.

Manual (estado `revisada`):
- [ ] Cada ejemplo **representa realmente** el concepto (revisado a nivel de píxel o vóxel).
- [ ] Hay al menos una comparativa correcto/incorrecto.
- [ ] Atajos y menús verificados en la versión actual de Aseprite / MagicaVoxel.
- [ ] La lección termina en una pieza concreta y el reto tiene variantes.
- [ ] Duración real ≤ 45 min (**probada por ti**: solo tú puedes pasarla a `publicada`).
- [ ] Referencias externas con licencia anotada en `CREDITS.md`.
