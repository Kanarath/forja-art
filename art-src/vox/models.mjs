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

// ---------- ROCA: un color plano → rampa de valor (AO pintado) → hue shifting
function rockShape() {
  const v = [];
  for (let x = -5; x <= 5; x++) for (let y = -4; y <= 4; y++) for (let z = 0; z <= 6; z++) {
    // un elipsoide achatado y algo irregular
    const d = (x / 5.4) ** 2 + (y / 4.4) ** 2 + ((z - 1.5) / 5) ** 2 + (((x * 7 + y * 3 + z * 5) % 5) - 2) * 0.03;
    if (d <= 1 && z >= 0) v.push({ x, y, z });
  }
  return v;
}
const rock = rockShape();
const maxZ = Math.max(...rock.map((v) => v.z));
const rockFlat = rock.map((v) => ({ ...v, c: "#8a8698" }));
// rampa de valor: más claro arriba (recibe luz), más oscuro abajo y en la base (oclusión)
const VALUE = ["#4a4656", "#6a6678", "#8a8698", "#aeaabb", "#d2cfdc"];
const HUE = ["#3c3f5e", "#5e6280", "#8a8698", "#b4ab9f", "#dcd3c2"]; // sombras frías, luces cálidas
const level = (v) => Math.max(0, Math.min(4, Math.round((v.z / maxZ) * 4 - (v.z === 0 ? 1 : 0))));
const rockValue = rock.map((v) => ({ ...v, c: VALUE[level(v)] }));
const rockHue = rock.map((v) => ({ ...v, c: HUE[level(v)] }));

// ---------- FAROL: estructura de metal → cristales → núcleo de luz (emisivo)
const IRON = "#3b3f4a", IRON_L = "#5c6270", GLASS = "#9fd8ff", FLAME = "#ffd36e", FLAME_C = "#fff3c4";
const lanternFrame = [
  ...box(0, 0, 0, 4, 4, 0, IRON), // base
  ...box(0, 0, 6, 4, 4, 6, IRON), // techo
  ...box(1, 1, 7, 3, 3, 7, IRON_L), // remate
  { x: 2, y: 2, z: 8, c: IRON_L }, // asa
  ...[0, 4].flatMap((x) => [0, 4].flatMap((y) => box(x, y, 1, x, y, 5, IRON_L))), // cuatro montantes
];
const panes = [];
for (let z = 1; z <= 5; z++) for (const [x, y] of [[1, 0], [2, 0], [3, 0], [1, 4], [2, 4], [3, 4], [0, 1], [0, 2], [0, 3], [4, 1], [4, 2], [4, 3]]) panes.push({ x, y, z, c: GLASS });
const flame = [...box(2, 2, 1, 2, 2, 1, IRON), { x: 2, y: 2, z: 2, c: FLAME }, { x: 2, y: 2, z: 3, c: FLAME_C }];

// ---------- KIT DEL HERRERO: tres props con la misma escala y paleta (yunque 16³ de referencia)
const IRON_D = "#3b3f4a", IRON_M = "#5c6270", IRON_H = "#8a92a3", OAK = "#8a5a3c", OAK_D = "#6b4430", WATER_B = "#38b6ff";
const anvil = [
  ...box(4, 5, 0, 11, 10, 1, IRON_D), // base
  ...box(6, 6, 2, 9, 9, 4, IRON_M), // cintura
  ...box(2, 5, 5, 13, 10, 6, IRON_M), // mesa
  ...box(2, 5, 7, 13, 10, 7, IRON_H), // superficie de trabajo (más clara: recibe la luz)
  ...box(14, 7, 6, 15, 8, 7, IRON_M), // cuerno
];
const hammer = [
  ...box(7, 7, 0, 8, 8, 9, OAK), // mango
  ...box(7, 7, 0, 8, 8, 1, OAK_D), // empuñadura más oscura
  ...box(4, 6, 10, 11, 9, 12, IRON_M), // cabeza
  ...box(4, 6, 12, 11, 9, 12, IRON_H),
];
const bucket = [];
for (let x = 3; x <= 12; x++) for (let y = 3; y <= 12; y++) for (let z = 0; z <= 7; z++) {
  const d = Math.hypot(x - 7.5, y - 7.5);
  if (d > 4.8) continue;
  const wall = d > 3.8 || z === 0;
  if (wall) bucket.push({ x, y, z, c: z === 2 || z === 6 ? IRON_M : OAK });
  else if (z <= 5) bucket.push({ x, y, z, c: WATER_B });
}

// ---------- ESPADA: blockout → guarda y empuñadura → filo y detalle
const swordBlock = [...box(7, 7, 0, 8, 8, 4, OAK), ...box(5, 7, 5, 10, 8, 5, IRON_M), ...box(7, 7, 6, 8, 8, 17, IRON_M)];
const swordGuard = [
  ...box(7, 7, 0, 8, 8, 4, OAK), ...box(7, 7, 0, 8, 8, 0, "#f2c14e"), // pomo dorado
  ...box(4, 7, 5, 11, 8, 5, "#d49a2a"), ...box(4, 7, 6, 4, 8, 6, "#d49a2a"), ...box(11, 7, 6, 11, 8, 6, "#d49a2a"),
  ...box(7, 7, 6, 8, 8, 17, IRON_M),
];
const swordFinal = [
  // de la etapa anterior quitamos solo la HOJA (columnas 7–8 desde z=6); las puntas de la guarda se quedan
  ...swordGuard.filter((v) => !(v.x >= 7 && v.x <= 8 && v.z >= 6)),
  ...box(7, 7, 6, 8, 8, 16, IRON_M).map((v) => ({ ...v, c: v.x === 7 ? IRON_H : IRON_M })), // filo claro a un lado
  { x: 7, y: 7, z: 17, c: IRON_H }, { x: 7, y: 8, z: 17, c: IRON_H }, // punta
  ...box(7, 7, 2, 8, 8, 2, OAK_D), // vendaje en la empuñadura
];

// ---------- PERSONAJE CHIBI: cabeza grande (casi la mitad de la altura)
const SKIN = "#f2c29b", HAIR = "#6b3d2e", TUNIC = "#3b6fd1", PANTS = "#4a4560", BOOT = "#3b2418";
const chibiBlock = [...box(2, 2, 7, 9, 9, 14, SKIN), ...box(3, 3, 2, 8, 8, 6, TUNIC), ...box(3, 4, 0, 8, 7, 1, PANTS)];
const chibiDetail = [
  ...box(3, 4, 0, 4, 7, 0, BOOT), ...box(7, 4, 0, 8, 7, 0, BOOT), // botas
  ...box(3, 4, 1, 4, 7, 1, PANTS), ...box(7, 4, 1, 8, 7, 1, PANTS), // piernas separadas
  ...box(3, 3, 2, 8, 8, 6, TUNIC), ...box(3, 3, 3, 8, 8, 3, "#6b3d2e"), // túnica y cinturón
  ...box(1, 5, 3, 2, 6, 5, SKIN), ...box(9, 5, 3, 10, 6, 5, SKIN), // brazos
  ...box(2, 2, 7, 9, 9, 12, SKIN), // cara
  ...box(2, 2, 12, 9, 9, 14, HAIR), ...box(2, 9, 8, 9, 9, 12, HAIR), // pelo arriba y detrás
  { x: 4, y: 1, z: 10, c: "#1b1030" }, { x: 4, y: 1, z: 9, c: "#1b1030" }, // ojo izquierdo (2 vóxels)
  { x: 7, y: 1, z: 10, c: "#1b1030" }, { x: 7, y: 1, z: 9, c: "#1b1030" }, // ojo derecho
];

// ---------- POSE del chibi: el mismo personaje saludando, con un paso adelante
const chibiPose = [
  ...chibiDetail
    .filter((v) => !(v.x >= 9 && v.x <= 10 && v.y >= 5 && v.y <= 6 && v.z >= 3 && v.z <= 5)) // quitamos el brazo derecho
    .map((v) => (v.x >= 3 && v.x <= 4 && v.z <= 1 ? { ...v, y: v.y - 1 } : v)), // la pierna izquierda avanza un vóxel
  ...box(9, 5, 5, 9, 6, 6, SKIN), // hombro
  ...box(10, 5, 6, 10, 6, 12, SKIN), // brazo levantado junto a la cabeza
];

// ---------- CRIATURA: slime voxel (cúpula), del bloque al gesto
const SLIME = { light: "#d8ffe6", mid: "#4ade80", dark: "#1f8a4c", eye: "#1b1030" };
function dome(rx, h) {
  const v = [];
  for (let x = -rx; x <= rx; x++) for (let y = -rx; y <= rx; y++) for (let z = 0; z < h; z++)
    if (Math.hypot(x / rx, y / rx, z / h) <= 1.02) v.push({ x, y, z, c: SLIME.mid });
  return v;
}
function slimeDetail(vox, eyeZ) {
  const minY = (x, z) => Math.min(...vox.filter((v) => v.x === x && v.z === z).map((v) => v.y));
  const eyes = new Set([-2, 2].flatMap((x) => eyeZ.map((z) => `${x},${minY(x, z)},${z}`)));
  const top = Math.max(...vox.map((v) => v.z));
  return vox.map((v) => {
    if (eyes.has(`${v.x},${v.y},${v.z}`)) return { ...v, c: SLIME.eye };
    if (v.z <= 1) return { ...v, c: SLIME.dark }; // la base, en sombra (AO pintado)
    if (v.z >= top - 1 && v.x <= -1 && v.y <= -1) return { ...v, c: SLIME.light }; // brillo arriba a la izquierda
    return v;
  });
}
const slimeBlock = dome(5, 7);
const slimeColor = slimeDetail(slimeBlock, [3, 4]);
const slimeSquash = slimeDetail(dome(6, 5), [2, 3]);

// ---------- CASA MODULAR: piezas de 8×1×8 en rejilla, reutilizadas en las cuatro paredes
const PLASTER = "#e8dcc0", TIMBER = "#6b3d2e", BASE = "#7d8698", DOOR = "#a0603a", PANE = "#9fd8ff";
function wallModule(kind) {
  // coordenadas locales: u a lo largo de la pared (0–7), z de altura (0–7)
  const v = [];
  for (let u = 0; u <= 7; u++) for (let z = 0; z <= 7; z++) {
    let c = z === 0 ? BASE : u === 0 || u === 7 || z === 7 || z === 4 ? TIMBER : PLASTER;
    if (kind === "puerta" && u >= 3 && u <= 4 && z >= 1 && z <= 4) c = z === 2 && u === 4 ? "#f2c14e" : DOOR;
    if (kind === "ventana" && u >= 2 && u <= 5 && z >= 2 && z <= 5) c = u >= 3 && u <= 4 && z >= 3 && z <= 4 ? PANE : TIMBER;
    v.push({ u, z, c });
  }
  return v;
}
// colocar un módulo: a lo largo de X (frente/fondo) o de Y (laterales)
const along = (mod, axis, at, offset = 0) =>
  mod.map(({ u, z, c }) => (axis === "x" ? { x: u + offset, y: at, z, c } : { x: at, y: u + offset, z, c }));
const modulesLaidOut = [
  ...along(wallModule("lisa"), "x", 0, 0),
  ...along(wallModule("puerta"), "x", 0, 10),
  ...along(wallModule("ventana"), "x", 0, 20),
];
const houseWalls = [
  ...along(wallModule("lisa"), "x", 7), // fondo
  ...along(wallModule("ventana"), "y", 0), // lateral izquierdo
  ...along(wallModule("ventana"), "y", 7), // lateral derecho
  ...along(wallModule("puerta"), "x", 0), // fachada (la última gana en las esquinas)
];
const houseRoof = [];
for (let i = 0; i <= 4; i++) { // tejado a dos aguas: cada capa se estrecha un vóxel por lado
  for (let x = -1; x <= 8; x++) for (let y = -1 + i; y <= 8 - i; y++) houseRoof.push({ x, y, z: 8 + i, c: i % 2 ? ROOF.dark : ROOF.light });
}

export const MODELS = {
  "chibi-pose": {
    description: "El chibi voxel: de la pose neutra a una pose con intención",
    stages: [
      { label: "Pose neutra", note: "Simétrico y de frente: sirve para modelar, pero no cuenta nada.", voxels: chibiDetail },
      { label: "Saludo", note: "Un brazo levantado y una pierna un vóxel adelante. Con cambiar dos partes, el personaje ya hace algo.", voxels: chibiPose },
    ],
  },
  "slime-voxel": {
    description: "Slime voxel: una criatura que se lee por su forma",
    stages: [
      { label: "Blockout", note: "Una cúpula: redonda, baja y ancha. Antes de los ojos ya parece blanda e inofensiva.", voxels: slimeBlock },
      { label: "Color y ojos", note: "Base oscura (AO pintado), brillo arriba a la izquierda y dos ojos de 2 vóxels en la cara frontal.", voxels: slimeColor },
      { label: "Squash", note: "Más ancha y más baja con los mismos detalles: la pose de una criatura sin brazos es aplastarse o estirarse.", voxels: slimeSquash },
    ],
  },
  "casa-modular": {
    description: "Casa modular: tres piezas de pared reutilizadas",
    stages: [
      { label: "Tres módulos", note: "Pared lisa, con puerta y con ventana. Todas miden 8×1×8 y comparten zócalo, vigas y colores.", voxels: modulesLaidOut },
      { label: "Paredes", note: "Cuatro paredes hechas con esos mismos módulos: dos ventanas laterales, la puerta delante y la lisa detrás.", voxels: houseWalls },
      { label: "Tejado", note: "Un tejado a dos aguas escalonado, un vóxel más estrecho por capa y alternando dos rojos.", voxels: [...houseWalls, ...houseRoof] },
    ],
  },
  "kit-herrero": {
    description: "Kit del herrero: tres props con la misma escala y paleta",
    stages: [
      { label: "Yunque", note: "La pieza de referencia: cabe en 16×16×16. Hierro en tres tonos; la superficie de trabajo, la más clara.", voxels: anvil },
      { label: "Martillo", note: "La misma escala (un vóxel = la misma medida) y los mismos hierros que el yunque; el mango, de la madera del kit.", voxels: hammer },
      { label: "Cubo de agua", note: "Madera y aros de hierro de la misma paleta: los tres props parecen del mismo taller.", voxels: bucket },
    ],
  },
  espada: {
    description: "Espada voxel: del blockout al detalle",
    stages: [
      { label: "Blockout", note: "Tres bloques: empuñadura, guarda y hoja. La proporción (hoja larga, guarda ancha) ya dice «espada».", voxels: swordBlock },
      { label: "Guarda y pomo", note: "Guarda dorada con las puntas dobladas y un pomo: el detalle va donde mira la vista, en el centro.", voxels: swordGuard },
      { label: "Filo y punta", note: "Un lado de la hoja más claro (el filo que recibe la luz), punta y vendaje en la empuñadura.", voxels: swordFinal },
    ],
  },
  chibi: {
    description: "Personaje chibi voxel",
    stages: [
      { label: "Blockout", note: "Tres bloques: cabeza grande (casi la mitad de la altura), cuerpo y piernas. Las proporciones chibi se deciden aquí.", voxels: chibiBlock },
      { label: "Detalle", note: "Pelo, ojos de 2 vóxels, brazos, cinturón y botas: los mismos colores que el héroe chibi de pixel art.", voxels: chibiDetail },
    ],
  },
  roca: {
    description: "Roca: del color plano a la rampa con hue shifting",
    stages: [
      { label: "Un color", note: "Un solo color: la forma existe, pero en el render dependerá solo de la luz. Sin render, parece plana.", voxels: rockFlat },
      { label: "Rampa de valor", note: "Cinco tonos de la misma piedra: más claros arriba, más oscuros abajo. Es «AO pintado»: oclusión dibujada en el color.", voxels: rockValue },
      { label: "Hue shifting", note: "Los mismos valores, pero las sombras giran hacia el azul y las luces hacia el ocre: la piedra parece iluminada por luz real.", voxels: rockHue },
    ],
  },
  farol: {
    description: "Farol: metal, cristal y luz",
    stages: [
      { label: "Estructura", note: "Hierro oscuro: base, techo y cuatro montantes. En MagicaVoxel, material Metal.", voxels: lanternFrame },
      { label: "Cristales", note: "Paneles de un azul muy claro. En MagicaVoxel, material Glass: dejan pasar la luz.", voxels: [...lanternFrame, ...panes] },
      { label: "Llama", note: "El núcleo amarillo, en material Emit: en el render ilumina el resto del farol. Aquí el cristal se ve opaco: baja «Capas» a 3 para ver la llama por dentro.", voxels: [...lanternFrame, ...panes, ...flame] },
    ],
  },
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
