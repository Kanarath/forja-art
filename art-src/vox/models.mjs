// MODELOS VOXEL DIDÁCTICOS, definidos como rejillas 3D (Z = altura, como en MagicaVoxel).
// tools/build-vox.mjs los convierte en archivos .vox reales (que puedes abrir en MagicaVoxel)
// en public/assets/vox/<modelo>_<n>.vox, uno por ETAPA de construcción.
//
// Cada etapa reconstruye el modelo completo hasta ese punto, como harías tú en el programa.

const box = (x0, y0, z0, x1, y1, z1, c) => {
  const v = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) v.push({ x, y, z, c });
  return v;
};
const paint = (voxels, test, c) => voxels.map((v) => (test(v) ? { ...v, c } : v));
const hollowOut = (voxels) => {
  // quita los vóxeles interiores (no se ven): el archivo pesa menos y se ve igual
  const s = new Set(voxels.map((v) => `${v.x},${v.y},${v.z}`));
  const n = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  return voxels.filter((v) => n.some(([dx, dy, dz]) => !s.has(`${v.x + dx},${v.y + dy},${v.z + dz}`)));
};

// --- paletas (coherentes entre modelos: madera, metal, piedra, vegetación)
const WOOD = { light: "#d08a50", mid: "#a0603a", dark: "#6b3d2e" };
const METAL = { light: "#c9d1dc", mid: "#8f9bab", dark: "#5c6676" };
const GOLD = { light: "#f2c14e", mid: "#d49a2a" };
const LEAF = { light: "#6ee59f", mid: "#3fbf7f", dark: "#2a8a5c" };

// ---------- BARRIL (cilindro de duelas con aros)
function cylinder(r, h, c) {
  const v = [];
  const R = Math.ceil(r);
  for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) if (Math.hypot(x, y) <= r) for (let z = 0; z < h; z++) v.push({ x, y, z, c });
  return v;
}
const barrel1 = cylinder(3.3, 9, WOOD.mid);
const barrel2 = paint(barrel1, (v) => v.z === 1 || v.z === 7, METAL.mid);
const barrel3 = paint(
  paint(barrel2, (v) => v.z !== 1 && v.z !== 7 && (Math.round(Math.atan2(v.y, v.x) * 3) % 2 === 0), WOOD.dark),
  (v) => v.z === 8 && Math.hypot(v.x, v.y) < 2.4,
  WOOD.light,
);

// ---------- CAJA de madera 8×8×8
const crate1 = box(0, 0, 0, 7, 7, 7, WOOD.mid);
const edge = (v) => [v.x === 0 || v.x === 7, v.y === 0 || v.y === 7, v.z === 0 || v.z === 7].filter(Boolean).length >= 2;
const crate2 = paint(crate1, edge, WOOD.dark);
// diagonal de refuerzo en las caras visibles
const crate3 = paint(crate2, (v) => !edge(v) && ((v.y === 0 || v.y === 7) && v.x === v.z || (v.x === 7 || v.x === 0) && v.y === v.z), WOOD.light);

// ---------- COFRE 10×6×7: base, tapa redondeada, bandas, cerradura
const chest1 = box(0, 0, 0, 9, 5, 3, WOOD.mid);
const lid = [...box(0, 0, 4, 9, 5, 4, WOOD.light), ...box(0, 1, 5, 9, 4, 5, WOOD.light), ...box(0, 2, 6, 9, 3, 6, WOOD.light)];
const chest2 = [...chest1, ...lid];
const chest3 = paint(chest2, (v) => v.x === 2 || v.x === 7, METAL.mid);
const chest4 = [...paint(chest3, (v) => v.z === 3 && v.y === 0, WOOD.dark), ...box(4, -1, 2, 5, -1, 4, GOLD.light), { x: 4, y: -1, z: 3, c: GOLD.mid }];

// ---------- PRIMITIVAS (operaciones de construcción)
const prim = {
  cubo: box(0, 0, 0, 5, 5, 5, "#38b6ff"),
  esfera: (() => {
    const v = [];
    for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) for (let z = -4; z <= 4; z++) if (Math.hypot(x, y, z) <= 3.8) v.push({ x, y, z: z + 4, c: "#6ee59f" });
    return v;
  })(),
  cilindro: cylinder(3, 7, "#ffb84d"),
  piramide: (() => {
    const v = [];
    for (let z = 0; z < 5; z++) for (let x = z; x < 10 - z; x++) for (let y = z; y < 10 - z; y++) v.push({ x, y, z, c: "#ff6b4a" });
    return v;
  })(),
};

// ---------- ÁRBOL a dos resoluciones (la misma idea, distinto detalle)
function tree(scale) {
  const v = [];
  const s = scale; // 1 → cabe en 8³ ; 2 → cabe en 16³
  const cx = 4 * s - 0.5 * (s - 1), cy = cx;
  for (let z = 0; z < 3 * s; z++) for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) v.push({ x: Math.floor(cx) + x - Math.floor(s / 2), y: Math.floor(cy) + y - Math.floor(s / 2), z, c: WOOD.dark });
  const r = 3.2 * s;
  for (let x = 0; x < 8 * s; x++) for (let y = 0; y < 8 * s; y++) for (let z = 3 * s; z < 8 * s; z++) {
    const d = Math.hypot(x - cx, y - cy, (z - 5.2 * s) * 1.15);
    if (d <= r) v.push({ x, y, z, c: s > 1 && z > 6 * s ? LEAF.light : s > 1 && (x + y + z) % 5 === 0 ? LEAF.dark : LEAF.mid });
  }
  return v;
}

// ---------- SIMETRÍA: media seta y seta completa reflejada en X
function mushroomHalf() {
  const v = [];
  for (let x = 0; x <= 4; x++) for (let y = -4; y <= 4; y++) {
    for (let z = 0; z < 4; z++) if (Math.hypot(x, y) <= 1.6) v.push({ x, y, z, c: "#f4e6c8" });
    for (let z = 4; z < 8; z++) {
      const rr = 4.6 - (z - 4) * 0.9;
      if (Math.hypot(x, y) <= rr) v.push({ x, y, z, c: (x * 3 + y * 5 + z) % 7 === 0 && z > 4 ? "#f4e6c8" : "#d8343f" });
    }
  }
  return v;
}
const half = mushroomHalf();
const full = [...half, ...half.filter((v) => v.x > 0).map((v) => ({ ...v, x: -v.x }))];

// ---------- TORRE: blockout → muros con ventanas → tejado escalonado
const STONE = { light: "#9aa3b5", dark: "#7d8698" };
const ROOF = { light: "#c2413b", dark: "#9c2f2c" };
const tower1 = [...box(0, 0, 0, 3, 3, 6, STONE.light), ...box(-1, -1, 7, 4, 4, 9, ROOF.light)];
const towerWalls = box(0, 0, 0, 3, 3, 6, STONE.light)
  .filter((v) => v.x === 0 || v.y === 0 || v.x === 3 || v.y === 3)
  .map((v) => ({ ...v, c: (v.x + v.y + v.z) % 3 === 0 ? STONE.dark : STONE.light }))
  .map((v) => ((v.z === 4 && ((v.x === 3 && v.y === 1) || (v.y === 0 && v.x === 2))) ? { ...v, c: "#ffd36e" } : v));
const tower2 = [...towerWalls, ...box(-1, -1, 7, 4, 4, 9, ROOF.light)];
const steppedRoof = [];
for (let z = 7; z < 10; z++) {
  const r = z - 7; // cada capa se estrecha un vóxel por lado: así se «curva» un tejado en vóxels
  for (let x = -1 + r; x <= 4 - r; x++) for (let y = -1 + r; y <= 4 - r; y++) steppedRoof.push({ x, y, z, c: z % 2 ? ROOF.light : ROOF.dark });
}
const tower3 = [...towerWalls, ...steppedRoof];

export const MODELS = {
  torre: {
    description: "Torre de piedra: del blockout al tejado escalonado",
    stages: [
      { label: "Blockout", note: "Dos bloques: el cuerpo y el tejado. Ya se lee «torre» por proporción, sin un solo detalle.", voxels: tower1 },
      { label: "Muros y ventanas", note: "Dos tonos de piedra y dos ventanas iluminadas: detalle sobre una forma que ya funcionaba.", voxels: tower2 },
      { label: "Tejado escalonado", note: "Cada capa del tejado se estrecha un vóxel por lado: el escalonado es la forma de hacer inclinaciones y curvas con vóxels.", voxels: tower3 },
    ],
  },
  barril: {
    description: "Barril de duelas con aros metálicos",
    stages: [
      { label: "Blockout", note: "Un cilindro de madera: solo la forma y la proporción.", voxels: barrel1 },
      { label: "Aros", note: "Dos aros de metal pintados con el modo Paint sobre el mismo volumen.", voxels: barrel2 },
      { label: "Duelas y tapa", note: "Alternar dos tonos de madera marca las duelas; la tapa más clara recibe la luz.", voxels: barrel3 },
    ],
  },
  caja: {
    description: "Caja de madera 8×8×8 con marco y refuerzo",
    stages: [
      { label: "Cubo", note: "Un cubo de 8×8×8: la escala base de muchos props.", voxels: crate1 },
      { label: "Marco", note: "Las aristas más oscuras dibujan el marco y separan las caras.", voxels: crate2 },
      { label: "Refuerzo", note: "Una diagonal clara en las caras da lectura de «caja» a cualquier distancia.", voxels: crate3 },
    ],
  },
  cofre: {
    description: "Cofre del tesoro 10×6×7",
    stages: [
      { label: "Base", note: "La caja inferior: 10×6×4.", voxels: chest1 },
      { label: "Tapa", note: "La tapa curva se consigue escalonando tres capas cada vez más estrechas.", voxels: chest2 },
      { label: "Bandas", note: "Dos bandas de metal rompen la superficie y dan escala.", voxels: chest3 },
      { label: "Cerradura", note: "Un detalle dorado en el centro: el punto focal del prop.", voxels: chest4 },
    ],
  },
  primitivas: {
    description: "Las cuatro formas base de la construcción voxel",
    stages: Object.entries(prim).map(([k, v]) => ({ label: k[0].toUpperCase() + k.slice(1), note: "", voxels: v })),
  },
  arbol: {
    description: "El mismo árbol a dos resoluciones",
    stages: [
      { label: "8³", note: "En 8×8×8 cada vóxel es una decisión: tronco de 1 vóxel, copa redonda.", voxels: tree(1) },
      { label: "16³", note: "En 16×16×16 cabe volumen: luz arriba, tonos oscuros dentro de la copa.", voxels: tree(2) },
    ],
  },
  seta: {
    description: "Seta modelada con simetría",
    stages: [
      { label: "Media seta", note: "Con el espejo (Mirror) activado basta con modelar una mitad…", voxels: half },
      { label: "Reflejada", note: "…y el programa construye la otra. La mitad del trabajo, simetría perfecta.", voxels: full },
    ],
  },
};

export { hollowOut };
