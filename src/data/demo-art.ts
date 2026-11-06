// Arte de DEMOSTRACIÓN para las maquetas (tarea 1.2).
// Todo son datos: los sprites son paletas + filas de índices y los modelos voxel
// son listas de vóxeles en una rejilla 3D. Nada es una imagen pixelada ni una malla voxelizada.

export interface SpriteData {
  palette: Record<string, string>;
  rows: string[];
}

const OUT = "#1b1030";

export const gem: SpriteData = {
  palette: { "1": OUT, "2": "#c2186b", "3": "#ff4fa3", "4": "#ffd6ec" },
  rows: ["..11111..", ".1343321.", "133332221", ".1332221.", "..13221..", "...121...", "....1...."],
};

export const potion: SpriteData = {
  palette: { o: OUT, k: "#5a3a28", c: "#8a5a3c", g: "#cfe8ff", h: "#ffffff", r: "#e0245e", d: "#8a1040" },
  rows: [
    "...okko...",
    "...occo...",
    "..oooooo..",
    "...oggo...",
    "..oghggo..",
    ".ohgggggo.",
    "ohrrrrrrdo",
    "ohrrrrrddo",
    "orrrrrrddo",
    "orrrrrdddo",
    ".orrrdddo.",
    "..oooooo..",
  ],
};

export const sword: SpriteData = {
  palette: { o: OUT, s: "#eef3f8", m: "#8fa3b8", y: "#f2b33d", Y: "#a8661c", b: "#6b3d2e" },
  rows: [
    "...o...",
    "..oso..",
    ".ossmo.",
    ".ossmo.",
    ".ossmo.",
    ".ossmo.",
    ".ossmo.",
    ".ossmo.",
    ".ossmo.",
    "ooooooo",
    "oyyyyYo",
    "ooobooo",
    "..obo..",
    "..oyo..",
    "...o...",
  ],
};

export const chest: SpriteData = {
  palette: { o: OUT, l: "#d08a50", w: "#a0603a", W: "#6b3d2e", y: "#f2b33d", Y: "#a8661c" },
  rows: [
    ".oooooooooo.",
    "ollllyylllwo",
    "owwwwyywwwWo",
    "oooooyyooooo",
    "owwwoyyowwWo",
    "owwwoYYowwWo",
    "owwwwoowwwWo",
    "oWWWWWWWWWWo",
    "oooooooooooo",
  ],
};

export const slime: SpriteData = {
  palette: { o: OUT, g: "#4ade80", G: "#1f8a4c", h: "#d8ffe6", e: OUT },
  rows: [
    "...oooo...",
    "..oghggo..",
    ".oghggggo.",
    ".ogeggego.",
    "oggggggggo",
    "oggggggGGo",
    "oGGGGGGGGo",
    ".oooooooo.",
  ],
};

// ---------- VOXEL ----------
export interface Voxel { x: number; y: number; z: number; c: string }

const GRASS = "#5cc46a", GRASS_D = "#3f9a52", DIRT = "#8a5a3c", DIRT_D = "#6b4430";
const BARK = "#7a4b2e", LEAF = "#3fbf7f", LEAF_L = "#6ee59f", STONE = "#9aa3b5", WATER = "#38b6ff";

/** Pequeña isla-diorama: base de hierba y tierra, árbol, roca y un charco. */
export function islandDiorama(): Voxel[] {
  const v: Voxel[] = [];
  const N = 8;
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++) {
      const corner = (x === 0 || x === N - 1) && (y === 0 || y === N - 1);
      if (corner) continue;
      v.push({ x, y, z: 0, c: (x + y) % 3 === 0 ? DIRT_D : DIRT });
      const water = x >= 5 && x <= 6 && y >= 1 && y <= 2;
      v.push({ x, y, z: 1, c: water ? WATER : (x * 7 + y * 3) % 5 === 0 ? GRASS_D : GRASS });
    }
  // tronco
  for (let z = 2; z <= 4; z++) v.push({ x: 2, y: 4, z, c: BARK });
  // copa: esfera tosca
  for (let x = 0; x <= 4; x++)
    for (let y = 2; y <= 6; y++)
      for (let z = 5; z <= 7; z++) {
        const d = (x - 2) ** 2 + (y - 4) ** 2 + (z - 6) ** 2 * 1.6;
        if (d <= 5.2) v.push({ x, y, z, c: z === 7 || (x + y + z) % 4 === 0 ? LEAF_L : LEAF });
      }
  // roca
  v.push({ x: 5, y: 5, z: 2, c: STONE }, { x: 6, y: 5, z: 2, c: STONE }, { x: 5, y: 6, z: 2, c: STONE }, { x: 5, y: 5, z: 3, c: "#c3cad8" });
  return v;
}

/** Cofre voxel 6×4×4. */
export function voxelChest(): Voxel[] {
  const v: Voxel[] = [];
  for (let x = 0; x < 6; x++)
    for (let y = 0; y < 4; y++)
      for (let z = 0; z < 4; z++) {
        const band = x === 1 || x === 4;
        const lid = z === 3;
        v.push({ x, y, z, c: band ? "#f2b33d" : lid ? "#d08a50" : z === 2 ? "#6b3d2e" : "#a0603a" });
      }
  v.push({ x: 2, y: 4, z: 2, c: "#f2b33d" }, { x: 3, y: 4, z: 2, c: "#f2b33d" });
  return v;
}

/** Torre de piedra con tejado. */
export function voxelTower(): Voxel[] {
  const v: Voxel[] = [];
  for (let z = 0; z < 7; z++)
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++) {
        const edge = x === 0 || y === 0 || x === 3 || y === 3;
        if (!edge) continue;
        const window = z === 4 && ((x === 3 && y === 1) || (y === 3 && x === 2));
        v.push({ x, y, z, c: window ? "#ffd36e" : (x + y + z) % 3 === 0 ? "#7d8698" : "#9aa3b5" });
      }
  // tejado escalonado: cada capa se estrecha un vóxel por lado
  for (let z = 7; z < 10; z++) {
    const r = z - 7;
    for (let x = -1 + r; x <= 4 - r; x++)
      for (let y = -1 + r; y <= 4 - r; y++) v.push({ x, y, z, c: z % 2 ? "#c2413b" : "#9c2f2c" });
  }
  return v;
}
