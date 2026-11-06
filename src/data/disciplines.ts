// Registro de disciplinas y sus niveles.
// Es la «fuente de verdad» de la estructura de los cursos: la interfaz se genera a partir
// de aquí. En la tarea 1.4 pasará a Content Collections (archivos de contenido validados).
// Añadir una especialidad nueva = añadir una entrada a DISCIPLINES.

export type DisciplineId = "pixel" | "voxel" | "fundamentos";

export interface Level {
  n: number;
  title: string;
  summary: string;
  piece: string; // la pieza que forjas al terminar el nivel
}

export interface Discipline {
  id: DisciplineId;
  path: string; // etiqueta tipo «PATH 02»
  name: string;
  tagline: string;
  tool: string;
  href: string; // ruta relativa a la base del sitio
  levels: Level[];
}

export const PIXEL: Discipline = {
  id: "pixel",
  path: "PATH 02",
  name: "PIXEL FORGE",
  tagline: "Siluetas, clusters, rampas, personajes, animación y tilesets listos para Godot.",
  tool: "Aseprite (notas para Pixelorama)",
  href: "pixel/",
  levels: [
    { n: 0, title: "El taller", summary: "Instalar y configurar Aseprite, rejilla, pixel-perfect, atajos y exportación.", piece: "Lienzo plantilla" },
    { n: 1, title: "Píxel y silueta", summary: "Resolución, legibilidad y siluetas de objetos a 16×16.", piece: "Espada y poción legibles" },
    { n: 2, title: "Líneas y clusters", summary: "Líneas pixel-perfect, curvas, clusters, píxeles huérfanos y antialiasing selectivo.", piece: "Escudo redondo limpio" },
    { n: 3, title: "Valor, rampas y shading", summary: "Fuente de luz, rampas con hue shifting, contraste y dithering.", piece: "Gema y casco sombreados" },
    { n: 4, title: "Props y materiales", summary: "Metal, madera, piedra, cristal; iconos de inventario y microanimación.", piece: "Set de 8 iconos" },
    { n: 5, title: "Personajes y criaturas", summary: "Proporciones chibi JRPG, siluetas de clase, expresiones y enemigos.", piece: "Héroe y 2 enemigos" },
    { n: 6, title: "Animación", summary: "Timing, idle, ciclo de caminar en 4 direcciones, anticipación, VFX.", piece: "Héroe que camina y ataca" },
    { n: 7, title: "Tilesets y escenarios", summary: "Tiles 16×16, terrenos, agua animada y arquitectura modular.", piece: "Tileset de pueblo y bosque" },
    { n: 8, title: "Ilustración y composición", summary: "Perspectiva, profundidad, parallax e iluminación ambiental.", piece: "Ilustración 320×180" },
    { n: 9, title: "Producción en Godot", summary: "Spritesheets, import pixel-perfect, AnimatedSprite2D y TileMapLayer.", piece: "Personaje y tileset en Godot" },
    { n: 10, title: "Proyecto final", summary: "Mini escena JRPG jugable con identidad visual coherente.", piece: "Escena publicada" },
  ],
};

export const VOXEL: Discipline = {
  id: "voxel",
  path: "PATH 01",
  name: "VOXEL FORGE",
  tagline: "Props, personajes chibi, arquitectura y dioramas isométricos en MagicaVoxel.",
  tool: "MagicaVoxel (Blender opcional)",
  href: "voxel/",
  levels: [
    { n: 0, title: "El taller", summary: "Instalar MagicaVoxel, interfaz, modos y pinceles, paleta y primer render.", piece: "Primer render" },
    { n: 1, title: "Pensar en vóxels", summary: "Rejilla 3D, escala, resolución, primitivas, simetría y operaciones.", piece: "Barril y caja" },
    { n: 2, title: "Forma y silueta", summary: "Blockout, proporciones, escalonado y detalle por capas.", piece: "Cofre con tapa" },
    { n: 3, title: "Color y materiales", summary: "Paletas, rampas 3D, AO, madera, metal, piedra, agua y MATL.", piece: "Farol y materiales" },
    { n: 4, title: "Props", summary: "Armas, herramientas y mobiliario en una colección coherente.", piece: "Kit de herrero (5 props)" },
    { n: 5, title: "Personajes y criaturas", summary: "Proporciones chibi, expresiones, criaturas y pose básica.", piece: "Personaje y criatura" },
    { n: 6, title: "Arquitectura y naturaleza", summary: "Piezas modulares, edificios, árboles, rocas y terreno.", piece: "Casa modular y árboles" },
    { n: 7, title: "Dioramas", summary: "Composición isométrica, base, profundidad y storytelling.", piece: "Primer diorama" },
    { n: 8, title: "Render y presentación", summary: "Luz, AO, sombras, DOF, bloom y presentación de portfolio.", piece: "Render de portfolio" },
    { n: 9, title: "Producción en Godot", summary: "Exportar, pivotes, escala, optimización y GridMap.", piece: "Kit modular en Godot" },
    { n: 10, title: "Proyecto final", summary: "Diorama completo con assets propios.", piece: "Diorama publicado" },
  ],
};

export const FUNDAMENTOS: Discipline = {
  id: "fundamentos",
  path: "TRONCO COMÚN",
  name: "FUNDAMENTOS",
  tagline: "Teoría del arte que se practica en los dos mundos: lo que aprendes aquí sirve en pixel y en voxel.",
  tool: "Aseprite + MagicaVoxel",
  href: "fundamentos/",
  levels: [
    { n: 1, title: "Valor y lectura", summary: "Escala de grises y contraste: lo que hace que algo se lea.", piece: "Sprite y prop en 3 valores" },
    { n: 2, title: "Silueta y formas", summary: "Lenguaje de formas: círculo, cuadrado y triángulo.", piece: "3 siluetas en 2D y 3D" },
    { n: 3, title: "Color", summary: "Tono, saturación, temperatura y hue shifting.", piece: "Rampas en ambas disciplinas" },
    { n: 4, title: "Paletas y armonías", summary: "Paletas limitadas y coherencia de conjunto.", piece: "Paleta propia" },
    { n: 5, title: "Luz y sombra", summary: "Fuente, sombra propia y proyectada, rebote y AO.", piece: "Mismo objeto, una luz" },
    { n: 6, title: "Materiales", summary: "Cómo responde cada material a la luz.", piece: "Metal, madera y gema" },
    { n: 7, title: "Composición", summary: "Encuadre, jerarquía y lectura visual.", piece: "Escena encuadrada" },
    { n: 8, title: "Perspectiva", summary: "Top-down 3/4, lateral, isométrica y ortográfica.", piece: "Tile y cámara orto" },
    { n: 9, title: "Diseño de personajes", summary: "Silueta, proporción y personalidad.", piece: "Héroe en 2D y 3D" },
    { n: 10, title: "Storytelling y dirección de arte", summary: "Escenas que cuentan algo y estilo propio.", piece: "Escena con historia" },
  ],
};

export const DISCIPLINES: Discipline[] = [PIXEL, VOXEL, FUNDAMENTOS];
