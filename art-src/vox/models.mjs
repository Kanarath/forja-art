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
function slimeDetail(vox, eyeZ, eyeX = 2) {
  const minY = (x, z) => Math.min(...vox.filter((v) => v.x === x && v.z === z).map((v) => v.y));
  const eyes = new Set([-eyeX, eyeX].flatMap((x) => eyeZ.map((z) => `${x},${minY(x, z)},${z}`)));
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

// ---------- DIORAMA: una base de 22×22 con estratos, una escena pequeña encima y detalles que cuentan algo
// Reutiliza la casa modular y el árbol de 8³: un diorama es un kit montado sobre un trozo de suelo.
const DIRT = { light: "#8a5a3c", dark: "#6b4430" }, PATH = { light: "#b4ab9f", dark: "#8a8698" };
const WATER_D = "#1f4f9a", WATER_L = "#6fb8ff";
const move = (vox, dx, dy, dz) => vox.map((v) => ({ ...v, x: v.x + dx, y: v.y + dy, z: v.z + dz }));
const dioramaBase = box(0, 0, 0, 21, 21, 3, null).map((v) => ({
  ...v, c: v.z === 3 ? LEAF.mid : v.z === 0 ? STONE.dark : v.z === 2 ? DIRT.light : DIRT.dark,
}));
const inPond = (v) => Math.hypot(v.x - 4, v.y - 4.5) <= 2.8;
const onPath = (v) => v.x >= 10 && v.x <= 11 && v.y <= 8;
const dioramaScene = [
  ...dioramaBase
    .filter((v) => !(inPond(v) && v.z === 3)) // el estanque se hunde un vóxel en la hierba
    .map((v) => (inPond(v) && v.z === 2 ? { ...v, c: WATER_D } : onPath(v) && v.z === 3 ? { ...v, c: (v.y % 3 ? PATH.light : PATH.dark) } : v)),
  ...move([...houseWalls, ...houseRoof], 7, 9, 4), // la puerta (x 10–11) da al camino
  ...move(tree(1), 14, 12, 4),
];
const dioramaDetail = [
  ...dioramaScene.map((v) => {
    if (v.z === 2 && v.c === WATER_D && Math.hypot(v.x - 3.5, v.y - 4) <= 1.2) return { ...v, c: WATER_L }; // reflejo del cielo
    if (v.z === 3 && v.c === LEAF.mid && (v.x * 7 + v.y * 13) % 9 === 0) return { ...v, c: LEAF.light }; // la hierba no es un color plano
    return v;
  }),
  ...box(13, 4, 4, 13, 4, 8, IRON), { x: 13, y: 4, z: 9, c: FLAME }, // farola junto al camino (llama en Emit)
  ...[[2, 13], [4, 15], [3, 17], [17, 4], [19, 7]].map(([x, y], i) => ({ x, y, z: 4, c: i % 2 ? "#ffb84d" : "#fff3c4" })), // flores
  ...box(7, 2, 4, 8, 3, 4, STONE.light), { x: 8, y: 3, z: 5, c: STONE.dark }, // piedra junto al estanque
  ...box(5, 9, 4, 5, 9, 6, WOOD.mid), ...box(4, 9, 4, 4, 9, 4, WOOD.dark), // poste y cubo de leña junto a la casa
];

// ---------- TERRENO: un mapa de alturas en terrazas de 2 vóxels, estratos por altura y un río
// La altura se calcula con dos colinas suaves y se redondea a escalones: el escalonado ES el estilo.
const TER = 24;
const riverY = (x) => 5 + 2 * Math.sin(x / 3.5); // el río cruza por delante, de izquierda a derecha
const inRiver = (x, y) => Math.abs(y - riverY(x)) <= 1.3;
const terrainH = (x, y) => {
  const raw = 2 + 7 * Math.exp(-((x - 6) ** 2 + (y - 18) ** 2) / 50) + 4 * Math.exp(-((x - 18) ** 2 + (y - 19) ** 2) / 28);
  return Math.max(2, Math.floor(raw / 2) * 2); // terrazas: solo alturas pares
};
function terrain(stage) {
  const v = [];
  for (let x = 0; x < TER; x++) for (let y = 0; y < TER; y++) {
    const river = stage >= 3 && inRiver(x, y);
    const h = river ? 0 : terrainH(x, y);
    for (let z = 0; z < h; z++) {
      let c = STONE.light;
      if (stage >= 2) c = z === h - 1 ? LEAF.mid : z >= h - 3 ? DIRT.light : z % 4 < 2 ? STONE.dark : STONE.light; // hierba, tierra y piedra en bandas
      v.push({ x, y, z, c });
    }
    if (river) v.push({ x, y, z: 0, c: Math.abs(y - riverY(x)) < 0.5 ? WATER_L : WATER_D }); // agua en la altura 0: un vóxel por debajo de la llanura
  }
  return v;
}
const smallTree = (x, y, z) => [...box(x, y, z, x, y, z + 1, WOOD.dark), ...box(x - 1, y - 1, z + 2, x + 1, y + 1, z + 3, LEAF.mid), { x, y, z: z + 4, c: LEAF.light }];
const terrainLife = [
  ...terrain(3),
  ...[[4, 16], [8, 20], [19, 18], [14, 13], [2, 11]].flatMap(([x, y]) => smallTree(x, y, terrainH(x, y))),
  ...[[11, 9], [20, 10]].flatMap(([x, y]) => box(x, y, terrainH(x, y), x + 1, y, terrainH(x, y), STONE.dark)), // piedras sueltas
];

// ---------- CARRO: hard surface en vóxels (blockout → paneles → herrajes y chaflanes)
// Lo mismo que en Blender: volúmenes primero, luego paneles que rompen las superficies y al final el detalle mecánico.
function wheel(cx, y, cz, r, detail) {
  const v = [];
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
    const d = Math.hypot(x, z);
    if (d > r) continue;
    let c = WOOD.dark;
    if (detail) c = d > r - 1 ? METAL.dark /* llanta de hierro */ : d < 1 ? METAL.light /* buje */ : x === 0 || z === 0 ? WOOD.mid /* radios */ : null;
    if (c) v.push({ x: cx + x, y, z: cz + z, c });
  }
  return v;
}
const cartWheels = (detail) => [[3, -1], [3, 8], [11, -1], [11, 8]].flatMap(([x, y]) => wheel(x, y, 3, 3.2, detail));
const cartBlock = [...box(0, 0, 3, 14, 7, 7, WOOD.mid), ...cartWheels(false), ...box(15, 3, 4, 20, 4, 4, WOOD.dark)];
const cartBody = box(0, 0, 3, 14, 7, 7, WOOD.mid)
  .filter((v) => !(v.x > 0 && v.x < 14 && v.y > 0 && v.y < 7 && v.z > 3)) // caja abierta: paredes de 1 vóxel
  .map((v) => ({ ...v, c: v.z === 7 ? WOOD.light : v.z === 3 ? WOOD.dark : v.x % 4 === 0 || v.z === 5 ? WOOD.dark : WOOD.mid })); // borde claro, tablas y montantes
const cartPanels = [...cartBody, ...cartWheels(true), ...box(-1, 3, 3, 16, 4, 3, METAL.dark) /* eje y bastidor */, ...box(15, 3, 4, 20, 4, 4, WOOD.dark)];
const cartFinal = [
  // chaflán: se quitan las cuatro esquinas verticales del borde superior, como un bevel de 1 vóxel
  ...cartPanels.filter((v) => !(v.z === 7 && (v.x === 0 || v.x === 14) && (v.y === 0 || v.y === 7))),
  ...[0, 14].flatMap((x) => [0, 7].flatMap((y) => box(x, y, 4, x, y, 6, METAL.mid))), // escuadras de hierro en las esquinas
  ...[4, 8, 12].flatMap((x) => [{ x, y: -1, z: 7, c: METAL.light }, { x, y: 8, z: 7, c: METAL.light }]), // remaches en los lados
  ...box(2, 2, 4, 4, 4, 6, WOOD.light), ...box(9, 3, 4, 11, 5, 5, WOOD.light), // carga: dos cajas
  ...box(21, 2, 4, 21, 5, 4, METAL.mid), // travesaño de la lanza
];

// ---------- ÁRBOL ORGÁNICO: un tronco que se curva, ramas en diagonal y una copa en grupos
// Lo orgánico en vóxels es romper la simetría con pasos de 1: el tronco se desplaza, nunca gira de golpe.
const trunkX = (z) => Math.round(1.6 * Math.sin(z / 3.2)); // desplazamiento lateral del tronco
const orgTrunk = [];
for (let z = 0; z < 12; z++) {
  const t = z < 4 ? 2 : 1; // más grueso abajo
  const ox = 7 + trunkX(z);
  for (let x = 0; x < t; x++) for (let y = 0; y < t; y++) orgTrunk.push({ x: ox + x, y: 7 + y, z, c: z % 3 === 0 ? WOOD.dark : WOOD.mid });
  if (z === 0) orgTrunk.push(...box(ox - 1, 6, 0, ox + 2, 9, 0, WOOD.dark)); // raíces: la base se ensancha
  // en cada desplazamiento, un vóxel de «escalón» en la posición anterior: así cada capa toca a la de abajo por una CARA
  const prev = 7 + trunkX(z - 1);
  if (z > 0 && prev !== ox) for (let y = 0; y < t; y++) orgTrunk.push({ x: prev, y: 7 + y, z, c: WOOD.mid });
}
// una rama avanza en diagonal, pero se construye vóxel a vóxel (primero de lado, luego hacia arriba): siempre unida por caras
function branch(x, y, z, dx, dy, n) {
  const v = [];
  let p = { x, y, z };
  for (let i = 0; i < n; i++) {
    const t = { x: x + Math.round(dx * (i + 1)), y: y + Math.round(dy * (i + 1)), z: z + i };
    while (p.x !== t.x) { p = { ...p, x: p.x + Math.sign(t.x - p.x) }; v.push({ ...p, c: WOOD.mid }); }
    while (p.y !== t.y) { p = { ...p, y: p.y + Math.sign(t.y - p.y) }; v.push({ ...p, c: WOOD.mid }); }
    if (p.z !== t.z) { p = { ...p, z: t.z }; v.push({ ...p, c: WOOD.mid }); }
  }
  return v;
}
const orgBranchList = [branch(7 + trunkX(6), 7, 6, -1.2, 0.3, 5), branch(8 + trunkX(7), 7, 7, 1.2, -0.5, 5), branch(7 + trunkX(9), 7, 9, 0.2, 1.2, 4)];
const orgBranches = orgBranchList.flat();
const tips = [...orgBranchList.map((b) => b[b.length - 1]), { x: 7 + trunkX(11), y: 7, z: 11 }];
const orgCanopy = [];
tips.forEach((p, i) => {
  const r = [2.7, 2.5, 2.3, 3.0][i];
  for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) for (let z = -3; z <= 4; z++) {
    if (Math.hypot(x, y, z * 1.25) > r) continue;
    orgCanopy.push({ x: p.x + x, y: p.y + y, z: p.z + 1 + z, c: z >= 2 ? LEAF.light : z <= -1 ? LEAF.dark : LEAF.mid });
  }
});

// ---------- HABITACIÓN en corte: suelo y dos paredes (fondo e izquierda); el frente y la derecha, abiertos a la cámara
const FLOOR = { a: "#a0603a", b: "#8a5030" }, WALL = "#c9b8a0", WALL_D = "#a8967e", RUG = "#9c2f2c", RUG_L = "#c2413b", LINEN = "#e8dcc0";
const roomBox = [
  ...box(0, 0, 0, 13, 13, 0, null).map((v) => ({ ...v, c: v.x % 2 ? FLOOR.a : FLOOR.b })), // tablas del suelo a lo largo de Y
  ...box(0, 13, 1, 13, 13, 10, WALL), ...box(0, 0, 1, 0, 12, 10, WALL), // pared del fondo y pared izquierda
  ...box(0, 13, 1, 13, 13, 1, WALL_D), ...box(0, 0, 1, 0, 12, 1, WALL_D), // rodapié más oscuro
];
const bed = [...box(1, 8, 1, 5, 12, 2, WOOD.mid), ...box(1, 8, 3, 5, 12, 3, LINEN), ...box(1, 11, 4, 5, 12, 4, "#ffffff"), ...box(1, 12, 3, 5, 12, 5, WOOD.dark)];
const table = [...box(8, 7, 4, 11, 9, 4, WOOD.light), ...[[8, 7], [11, 7], [8, 9], [11, 9]].flatMap(([x, y]) => box(x, y, 1, x, y, 3, WOOD.dark))];
const chair = [...box(9, 4, 3, 10, 5, 3, WOOD.mid), ...[[9, 4], [10, 4], [9, 5], [10, 5]].flatMap(([x, y]) => box(x, y, 1, x, y, 2, WOOD.dark)), ...box(9, 3, 4, 10, 3, 6, WOOD.mid)];
const roomFurniture = [...roomBox, ...bed, ...table, ...chair];
const roomDetail = [
  // la alfombra va antes que los muebles: si coinciden, gana la pata de la silla
  ...box(4, 3, 1, 9, 6, 1, RUG).map((v) => ({ ...v, c: v.x === 4 || v.x === 9 || v.y === 3 || v.y === 6 ? RUG_L : RUG })), // alfombra con borde
  ...roomFurniture,
  ...box(7, 13, 5, 10, 13, 8, "#9fd8ff").map((v) => ({ ...v, c: v.x === 8 || v.z === 7 ? WOOD.dark : "#9fd8ff" })), // ventana con cruceta
  ...box(1, 3, 6, 1, 6, 6, WOOD.dark), // estante que sale 1 vóxel de la pared izquierda
  ...[[1, 3, "#3b6fd1"], [1, 4, "#c2413b"], [1, 5, "#3fa45b"]].flatMap(([x, y, c]) => box(x, y, 7, x, y, 8, c)), // libros
  { x: 10, y: 8, z: 5, c: "#f4e6c8" }, { x: 10, y: 8, z: 6, c: "#ffd36e" }, // vela sobre la mesa (llama en Emit)
];

// ---------- SALTO DEL SLIME en vóxels: los mismos cuatro tiempos que el sprite de P6-03, como etapas
function blob(rx, h, z0) {
  const v = [];
  for (let x = -rx; x <= rx; x++) for (let y = -rx; y <= rx; y++) for (let z = 0; z < h; z++)
    if (Math.hypot(x / rx, y / rx, (z - (h - 1) / 2) / (h / 2)) <= 1.02) v.push({ x, y, z: z + z0, c: SLIME.mid });
  return v;
}
// todas las etapas sobre el mismo disco de suelo de 13×13: así los cuatro .vox miden lo mismo en planta y
// el slime no «salta» de sitio al renderizarlos con la misma cámara
const jumpGround = []; for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) if (Math.hypot(x, y) <= 6.3) jumpGround.push({ x, y, z: 0, c: STONE.dark });
const onGround = (vox) => [...jumpGround, ...move(vox, 0, 0, 1)];
const slimeJump = [
  { label: "Reposo", note: "La cúpula de 11×11×7 de V5-01, con ojos y brillo, sobre un disco de piedra de 13×13 que comparten las cuatro etapas.", voxels: onGround(slimeDetail(dome(5, 7), [3, 4])) },
  { label: "Anticipación", note: "Aplastado: 13 de ancho y 5 de alto. Ocupa casi lo mismo: el volumen se conserva, como en el sprite.", voxels: onGround(slimeDetail(dome(6, 5), [2, 3])) },
  { label: "Estirado", note: "Una elipse estrecha y alta (7 de ancho, 10 de alto) separada 2 vóxels del suelo; los ojos se juntan porque la cara es más estrecha.", voxels: onGround(slimeDetail(blob(3, 10, 2), [7, 8], 1)) },
  { label: "Punto alto", note: "Redondo otra vez (9 de ancho, 8 de alto) y 6 vóxels por encima del suelo. Renderiza las cuatro etapas con la MISMA cámara y tendrás los frames del sprite.", voxels: onGround(slimeDetail(blob(4, 8, 6), [9, 10])) },
];

// ---------- COFRE VIEJO: el mismo cofre limpio, gastado y con historia (desgaste en bordes, óxido, musgo)
// Ruido determinista: el mismo vóxel recibe siempre el mismo valor, así el modelo no cambia al regenerarlo
const noise = (x, y, z) => (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0) % 100;
const RUST = "#d8743a", MOSS = { a: "#3fbf7f", b: "#2a8a5c" }, DIRT_D = "#4a3226", WOOD_W = "#dcb47e";
const oldBase = box(0, 0, 0, 11, 7, 4, WOOD.mid).map((v) => ({ ...v, c: v.z === 4 ? WOOD.dark : WOOD.mid }));
const oldLid = [...box(0, 0, 5, 11, 7, 5, WOOD.mid), ...box(0, 1, 6, 11, 6, 6, WOOD.mid), ...box(0, 2, 7, 11, 5, 7, WOOD.mid)];
const isBand = (v) => v.x === 2 || v.x === 9;
const oldLock = [...box(5, -1, 3, 6, -1, 5, GOLD.light), { x: 5, y: -1, z: 4, c: GOLD.mid }, { x: 6, y: -1, z: 4, c: GOLD.mid }];
const chestClean = hollowOut([...paint([...oldBase, ...oldLid], isBand, METAL.mid), ...oldLock]);
// arista: el vóxel está en el borde de dos caras a la vez (en la base o en la tapa)
const onEdge = (v) => {
  const ex = v.x === 0 || v.x === 11;
  const ey = v.z <= 4 ? v.y === 0 || v.y === 7 : v.z === 5 ? v.y === 0 || v.y === 7 : v.z === 6 ? v.y === 1 || v.y === 6 : v.y === 2 || v.y === 5;
  const ez = v.z === 0 || v.z === 4 || v.z === 7;
  return [ex, ey, ez].filter(Boolean).length >= 2;
};
const chestWorn = chestClean
  .filter((v) => !(onEdge(v) && !isBand(v) && v.c !== GOLD.light && v.c !== GOLD.mid && noise(v.x, v.y, v.z) < 22)) // desconchones: faltan trozos de arista
  .map((v) => {
    if (isBand(v) && v.c === METAL.mid) return { ...v, c: noise(v.x, v.y, v.z) < 30 ? RUST : noise(v.x, v.y, v.z) < 55 ? METAL.dark : METAL.mid }; // óxido a manchas
    if (onEdge(v) && v.c !== GOLD.light && v.c !== GOLD.mid) return { ...v, c: WOOD_W }; // la madera se aclara donde más se toca
    return v;
  });
const chestStory = chestWorn.map((v) => {
  if (v.c === GOLD.light || v.c === GOLD.mid) return v;
  const n = noise(v.x + 5, v.y, v.z);
  if (v.z <= 1 && v.x <= 5 && n < 75) return { ...v, c: v.z === 0 ? MOSS.b : MOSS.a }; // musgo: sube desde el suelo, por el lado en sombra
  if (v.z >= 6 && v.x <= 2 && n < 60) return { ...v, c: MOSS.a }; // y se queda en la tapa, donde se acumula el agua
  if (v.z === 0 && n < 70) return { ...v, c: DIRT_D }; // barro en la base
  return v;
}).concat([{ x: 13, y: 2, z: 0, c: GOLD.light }, { x: 14, y: 3, z: 0, c: GOLD.mid }, { x: 13, y: 4, z: 0, c: GOLD.light }]); // monedas caídas: alguien lo abrió con prisa

// ---------- MURCIÉLAGO: un cuerpo pequeño y alas de 1 vóxel de grosor
const BAT = { fur: "#4a3a5e", belly: "#6a5a80", wing: "#8a5a7a", bone: "#2e2440", eye: "#ffd36e", fang: "#d8ccb4" };
const batBody = [];
for (let x = -3; x <= 3; x++) for (let y = -3; y <= 3; y++) for (let z = 0; z <= 13; z++) {
  const body = Math.hypot(x / 2.6, y / 2.2, (z - 5) / 3.4) <= 1;
  const head = Math.hypot(x / 2.2, y / 2.1, (z - 9.5) / 2) <= 1;
  if (body || head) batBody.push({ x, y, z, c: body && !head && y === -2 && Math.abs(x) <= 1 ? BAT.belly : BAT.fur });
}
const batEars = [-1, 1].flatMap((s) => [{ x: s, y: 0, z: 12, c: BAT.fur }, { x: 2 * s, y: 0, z: 12, c: BAT.fur }, { x: 2 * s, y: 0, z: 13, c: BAT.fur }]);
// perfil del ala derecha en el plano X–Z (a = distancia al centro). Borde de ataque: hombro → muñeca → punta.
const WRIST = [6, 10], WING_TIP = [12, 9];
const wingTop = (a) => Math.round(a <= 6 ? 8 + ((a - 3) * 2) / 3 : 10 - (a - 6) / 6);
// borde de salida: entre la punta de cada dedo la membrana se recoge hacia arriba (festón)
const TRAIL = [[3, 3], [8, 3], [11, 5], [12, 8]];
const wingBottom = (a) => {
  for (let i = 0; i < TRAIL.length - 1; i++) {
    const [x0, z0] = TRAIL[i], [x1, z1] = TRAIL[i + 1];
    if (a >= x0 && a <= x1) { const t = (a - x0) / (x1 - x0); return Math.round(z0 + (z1 - z0) * t + 1.4 * Math.sin(Math.PI * t)); }
  }
  return 8;
};
function batWing(s, bones) {
  const v = [];
  for (let a = 3; a <= 12; a++) for (let z = wingBottom(a); z <= wingTop(a); z++) v.push({ x: s * a, y: 0, z, c: BAT.wing });
  if (!bones) return v;
  const lines = [[[3, 8], WRIST], [WRIST, WING_TIP], [WRIST, [11, 5]], [WRIST, [8, 3]]]; // brazo y tres dedos
  const out = new Map(v.map((p) => [`${p.x},${p.z}`, p]));
  for (const [[x0, z0], [x1, z1]] of lines) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0));
    for (let i = 0; i <= n; i++) {
      const x = s * Math.round(x0 + ((x1 - x0) * i) / n), z = Math.round(z0 + ((z1 - z0) * i) / n);
      if (out.has(`${x},${z}`)) out.set(`${x},${z}`, { x, y: 0, z, c: BAT.bone });
    }
  }
  return [...out.values()];
}
const batWings = (bones) => [...batWing(-1, bones), ...batWing(1, bones)];
const batFace = [
  { x: -1, y: -2, z: 10, c: BAT.eye }, { x: 1, y: -2, z: 10, c: BAT.eye }, // ojos: lo más claro del modelo
  { x: -1, y: -2, z: 8, c: BAT.fang }, { x: 1, y: -2, z: 8, c: BAT.fang }, // colmillos
  { x: 0, y: -2, z: 9, c: BAT.belly }, // hocico
  { x: -1, y: 0, z: 1, c: BAT.bone }, { x: 1, y: 0, z: 1, c: BAT.bone }, // garras
];

// ---------- PUENTE Y ESCALERAS: dos orillas a distinta altura, un río y cómo conectarlas
// Orilla izquierda alta (suelo en z=4), río en medio, orilla derecha baja (suelo en z=1).
const WATER_M = "#38b6ff";
const bankL = box(0, 0, 0, 7, 9, 4, null).map((v) => ({ ...v, c: v.z === 4 ? LEAF.mid : v.z === 3 ? DIRT.light : v.z === 0 ? STONE.dark : DIRT.dark }));
const river = box(8, 0, 0, 15, 9, 0, null).map((v) => ({ ...v, c: v.y % 3 === 1 && v.x % 4 === 1 ? WATER_L : WATER_M })); // el agua, 1 vóxel por debajo de la orilla baja
const bankR = box(16, 0, 0, 23, 9, 1, null).map((v) => ({ ...v, c: v.z === 1 ? LEAF.mid : DIRT.dark }));
const bridgeHeights = [...bankL, ...river, ...bankR];
// escalera de piedra: rellano a la altura del puente y peldaños de 1 de alto y 2 de fondo hasta el suelo bajo
const stepTop = (x) => (x <= 17 ? 4 : x <= 19 ? 3 : 2);
const stairs = [];
for (let x = 16; x <= 21; x++) for (let y = 2; y <= 7; y++) for (let z = 2; z <= stepTop(x); z++) stairs.push({ x, y, z, c: z === stepTop(x) ? STONE.light : STONE.dark });
const pier = box(11, 2, 0, 12, 7, 3, STONE.dark).map((v) => ({ ...v, c: v.z === 3 ? STONE.light : STONE.dark })); // pila en mitad del río
const bridgeStairs = [...bridgeHeights.filter((v) => !(v.x >= 11 && v.x <= 12 && v.y >= 2 && v.y <= 7)), ...pier, ...stairs];
const deck = box(8, 2, 4, 15, 7, 4, null).map((v) => ({ ...v, c: v.x % 2 ? WOOD.light : WOOD.mid })); // tablas cruzadas, en dos tonos
const beams = [...box(8, 2, 3, 15, 2, 3, WOOD.dark), ...box(8, 7, 3, 15, 7, 3, WOOD.dark)].filter((v) => !(v.x >= 11 && v.x <= 12)); // vigas bajo el tablero
const rails = [
  ...[8, 11, 12, 15].flatMap((x) => [2, 7].flatMap((y) => box(x, y, 5, x, y, 5, WOOD.dark))), // postes
  ...box(8, 2, 6, 15, 2, 6, WOOD.dark), ...box(8, 7, 6, 15, 7, 6, WOOD.dark), // pasamanos
];
const pathL = box(0, 3, 4, 7, 6, 4, null).map((v) => ({ ...v, c: (v.x + v.y) % 3 ? PATH.light : PATH.dark })); // el camino llega al puente
const lampPost = [...box(6, 1, 5, 6, 1, 8, WOOD.dark), { x: 6, y: 1, z: 9, c: "#ffd36e" }];
const bridgeFinal = [...bridgeStairs.filter((v) => !(v.z === 4 && v.x <= 7 && v.y >= 3 && v.y <= 6)), ...pathL, ...beams, ...deck, ...rails, ...lampPost];

// ---------- POCIÓN de 8×8×8: un prop pequeño donde cada vóxel cuenta
const POT = { glass: "#9fd8ff", liq: "#e8484f", liqD: "#9c2234", liqL: "#ff8a8a", cork: "#d08a50", corkD: "#a0603a", string: "#6b3d2e", label: "#f4e6c8", ink: "#5b4a7a", shine: "#ffffff" };
const potBody = [];
for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) for (let z = 0; z <= 4; z++) if (Math.hypot(x - 3.5, y - 3.5, (z - 2) * 1.15) <= 3.6) potBody.push({ x, y, z });
const potNeck = [...box(3, 3, 5, 4, 4, 5, null), ...box(2, 2, 6, 5, 5, 6, null).filter((v) => !((v.x === 2 || v.x === 5) && (v.y === 2 || v.y === 5)))];
const potSilhouette = [...potBody, ...potNeck].map((v) => ({ ...v, c: POT.glass }));
const potLiquid = [
  ...potBody.map((v) => ({ ...v, c: v.z <= 2 ? (v.z === 0 ? POT.liqD : POT.liq) : v.z === 3 && Math.hypot(v.x - 3.5, v.y - 3.5) < 2.6 ? POT.liqL : POT.glass })),
  ...potNeck.map((v) => ({ ...v, c: v.z === 5 ? POT.string : POT.glass })),
  ...box(3, 3, 7, 4, 4, 7, POT.cork), { x: 3, y: 3, z: 6, c: POT.corkD }, { x: 4, y: 4, z: 6, c: POT.corkD },
];
const potFront = (v) => v.y === Math.min(...potBody.filter((p) => p.x === v.x && p.z === v.z).map((p) => p.y));
const potDetail = potLiquid.map((v) => {
  if ((v.z === 1 || v.z === 2) && v.x >= 2 && v.x <= 5 && potBody.some((p) => p.x === v.x && p.y === v.y && p.z === v.z) && potFront(v)) return { ...v, c: v.x === 3 && v.z === 2 ? POT.ink : POT.label }; // etiqueta delante (4×2) con una marca
  if (v.z === 1 && v.x === 6 && potFront(v)) return { ...v, c: POT.liqL }; // una burbuja
  if (v.z === 4 && v.x === 2 && v.y === 2) return { ...v, c: POT.shine }; // brillo del cristal, arriba a la izquierda
  return v;
});

// ---------- RUINAS: un pórtico de piedra intacto, roto con intención y abandonado
const RUIN = { a: "#b4ab9f", b: "#9a9184", c: "#7d7568", d: "#5e584e" };
const rnoise = (x, y, z) => (((x * 92837111) ^ (y * 689287499) ^ (z * 283923481)) >>> 0) % 100;
const stoneC = (v) => (v.z % 3 === 0 ? RUIN.c : (v.x + v.z) % 4 === 0 ? RUIN.b : RUIN.a); // hiladas de sillares
const ruinFloor = box(0, -3, 0, 15, 7, 0, null).map((v) => ({ ...v, c: (v.x + v.y) % 2 ? RUIN.b : RUIN.c }));
const pillar = (x0) => [...box(x0 - 1, 1, 1, x0 + 3, 5, 1, null), ...box(x0, 2, 2, x0 + 2, 4, 10, null), ...box(x0 - 1, 1, 11, x0 + 3, 5, 11, null)].map((v) => ({ ...v, c: v.z === 1 || v.z === 11 ? RUIN.d : stoneC(v) })); // basa, fuste y capitel
const lintel = box(1, 1, 12, 13, 5, 13, null).map((v) => ({ ...v, c: v.z === 13 ? RUIN.a : RUIN.b }));
const ruinIntact = [...ruinFloor, ...pillar(2), ...pillar(10), ...lintel];
// rotura: una grieta diagonal corta el pilar derecho y el dintel se parte donde no tiene apoyo
const crackZ = (x) => 6 + (x - 10) * 1.2; // el plano de rotura sube hacia el lado de fuera: el muñón es más bajo junto al hueco del pórtico
const broken = ruinIntact.filter((v) => {
  if (v.x >= 9 && v.z >= 2 && v.z <= 11 && v.z > crackZ(v.x) + (rnoise(v.x, v.y, 0) % 3) - 1) return false; // pilar partido con borde irregular
  if (v.z >= 12 && v.x >= 8) return false; // sin el pilar, el dintel cae a partir de aquí
  if (v.z >= 12 && v.x === 7 && rnoise(v.x, v.y, v.z) < 50) return false; // borde de la rotura del dintel, mellado
  if (v.x <= 5 && v.z >= 2 && v.z <= 10 && (v.x === 2 || v.x === 4 || v.y === 2 || v.y === 4) && rnoise(v.x, v.y, v.z) < 8) return false; // desconchones en el pilar que queda
  return true;
});
// cascotes: los trozos que faltan están en el suelo, al pie de donde cayeron
const rubble = [
  ...box(10, -2, 1, 13, 0, 2, null), // un trozo de dintel tumbado
  ...box(14, 2, 1, 15, 3, 2, null), ...box(12, 6, 1, 13, 7, 1, null), { x: 9, y: 6, z: 1 }, { x: 15, y: 5, z: 1 }, { x: 11, y: -1, z: 3 },
].map((v) => ({ ...v, c: v.z === 1 ? RUIN.c : RUIN.b }));
const ruinBroken = [...broken, ...rubble];
const ruinOld = [
  ...ruinBroken.map((v) => {
    const n = rnoise(v.x + 3, v.y, v.z);
    if (v.z === 0 && n < 35) return { ...v, c: LEAF.dark }; // hierba entre las losas
    if (v.z === 13 && n < 55) return { ...v, c: LEAF.mid }; // musgo encima del dintel, donde se queda el agua
    if (v.z <= 2 && n < 30) return { ...v, c: LEAF.dark }; // humedad y musgo abajo
    return v;
  }),
  // hiedra: baja por la cara de fuera del pilar izquierdo, en una línea que se ramifica
  ...[[0, 3, 10], [0, 3, 9], [0, 2, 8], [0, 2, 7], [0, 3, 6], [0, 4, 5], [0, 4, 4], [0, 3, 3], [0, 2, 2], [0, 4, 7], [0, 4, 8]].map(([, y, z]) => ({ x: 1, y, z, c: z % 2 ? LEAF.mid : LEAF.light })), // pegada a la cara de fuera del fuste (x = 1)
  { x: 3, y: 0, z: 1, c: LEAF.light }, { x: 14, y: 1, z: 1, c: LEAF.light }, { x: 6, y: 6, z: 1, c: LEAF.mid }, // matas
];

// ---------- KIT DE VEGETACIÓN: piezas pequeñas y cómo repartirlas
const bush = (r, h, seed) => { const v = []; for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = 0; z < h; z++) if (Math.hypot(x / r, y / r, (z - h / 2 + 0.5) / (h / 2)) <= 1.05 && rnoise(x + seed, y, z) > 8) v.push({ x, y, z, c: z >= h - 1 ? LEAF.light : z === 0 ? LEAF.dark : LEAF.mid }); return v; };
const stoneP = (w, d, h) => box(0, 0, 0, w - 1, d - 1, h - 1, null).filter((v) => !(v.z === h - 1 && (v.x === 0 || v.x === w - 1) && (v.y === 0 || v.y === d - 1))).map((v) => ({ ...v, c: v.z === h - 1 ? STONE.light : STONE.dark }));
const tuft = (h) => box(0, 0, 0, 0, 0, h - 1, null).map((v) => ({ ...v, c: v.z === h - 1 ? LEAF.light : LEAF.mid }));
const KIT = [bush(2, 3, 1), bush(3, 4, 2), bush(4, 5, 3), stoneP(3, 2, 2), stoneP(4, 3, 3), tuft(1), tuft(2), [...tuft(2), ...move(tuft(1), 1, 0, 0)]];
const kitPieces = KIT.flatMap((p, i) => move(p, [0, 7, 16, 26, 32, 39, 42, 45][i], 0, 0));
const vegGround = box(0, 0, 0, 23, 23, 0, null).map((v) => ({ ...v, c: (v.x * 3 + v.y) % 7 ? "#4a6a3a" : "#3a5a30" })); // suelo oliva oscuro: más apagado que las plantas, para que destaquen
const place = (list) => [...vegGround, ...list.flatMap(([i, x, y]) => move(KIT[i], x, y, 1))];
// error: cada pieza en una rejilla, a la misma distancia
const vegGrid = place([[1, 4, 4], [3, 11, 3], [1, 19, 4], [6, 4, 11], [4, 11, 11], [6, 19, 11], [1, 4, 19], [3, 11, 19], [1, 19, 19]]);
// en grupos: una masa grande con piezas medianas y pequeñas pegadas, piedras al pie y hierba alrededor; huecos vacíos
const vegClusters = place([
  [2, 6, 7], [1, 10, 5], [0, 4, 11], [4, 9, 9], [6, 12, 8], [5, 3, 4], [7, 13, 11], // grupo principal
  [1, 18, 17], [0, 20, 20], [3, 15, 18], [6, 21, 16], // grupo secundario, más pequeño
  [5, 9, 19], [6, 19, 4], [5, 2, 20], // hierba suelta, poca
]);

// ---------- MAZMORRA: una sala de piedra en corte, con atrezo y luz de antorchas
const DUN = { floorA: "#4a4656", floorB: "#3e3a4a", wall: "#5e5a6e", wallD: "#46425a", mortar: "#2e2a3a", bone: "#e8dcc0", moss: "#2a5a3c", puddle: "#2a4a6a" };
const dunRoom = [
  ...box(0, 0, 0, 15, 15, 0, null).map((v) => ({ ...v, c: (Math.floor(v.x / 2) + Math.floor(v.y / 2)) % 2 ? DUN.floorA : DUN.floorB })), // losas de 2×2
  ...box(0, 15, 1, 15, 15, 8, null), ...box(0, 0, 1, 0, 14, 8, null), // pared del fondo e izquierda
].map((v) => (v.z === 0 ? v : { ...v, c: v.z % 2 === 0 ? DUN.mortar : ((v.z % 4 === 1 ? v.x + v.y : v.x + v.y + 2) % 4 === 0 ? DUN.mortar : (v.x + v.y + v.z) % 5 === 0 ? DUN.wallD : DUN.wall) })); // sillares con juntas alternas
const dunPillar = box(12, 12, 1, 13, 13, 8, null).map((v) => ({ ...v, c: v.z === 1 || v.z === 8 ? DUN.mortar : DUN.wall }));
const torch = (x, y, side) => [...box(x, y, 4, x, y, 5, WOOD.dark), { x: x + side[0], y: y + side[1], z: 4, c: IRON }]; // soporte en la pared y mango
// un cofre pequeño (5×3×4), a la escala de la sala: el del curso mide 10 y la llenaría
const dunChest = move([...box(0, 0, 0, 4, 2, 2, WOOD.mid), ...box(0, 0, 3, 4, 2, 3, WOOD.light), ...box(2, 0, 0, 2, 2, 3, METAL.mid), { x: 2, y: -1, z: 2, c: GOLD.light }], 2, 11, 1);
const dunProps = [
  ...dunRoom, ...dunPillar, ...dunChest, ...torch(6, 14, [0, 1]), ...torch(1, 6, [-1, 0]),
  ...[[13, 2], [14, 2], [14, 3]].map(([x, y]) => ({ x, y, z: 1, c: WOOD.mid })), // tablas rotas en el suelo
];
const dunStory = [
  ...dunProps.map((v) => (v.z === 0 && Math.hypot(v.x - 12, v.y - 5) < 2.2 ? { ...v, c: DUN.puddle } : v.z <= 2 && (v.x === 0 || v.y === 15) && (v.x + v.y * 3 + v.z) % 4 === 0 ? { ...v, c: DUN.moss } : v)), // charco y humedad en la base de las paredes
  { x: 6, y: 14, z: 6, c: "#ff8f3a" }, { x: 6, y: 14, z: 7, c: "#ffe58a" }, { x: 1, y: 6, z: 6, c: "#ff8f3a" }, { x: 1, y: 6, z: 7, c: "#ffe58a" }, // llamas (Emit)
  ...[[5, 4], [6, 4], [7, 5], [6, 3]].map(([x, y]) => ({ x, y, z: 1, c: DUN.bone })), { x: 4, y: 4, z: 1, c: DUN.bone }, { x: 4, y: 4, z: 2, c: DUN.bone }, // huesos y un cráneo
  ...box(12, 12, 9, 13, 13, 9, null).map((v) => ({ ...v, c: DUN.moss })), // musgo encima del pilar, donde se acumula la humedad
];

// ---------- ESCUDO redondo: forma, estructura y emblema (13×13, de cara a -Y)
const SH = { a: "#a0603a", b: "#8a5030", rim: "#8f9bab", rimD: "#5c6676", boss: "#c9d1dc", paint: "#c2413b", paintL: "#e8dcc0" };
const inDisc = (x, z, r = 6.4) => Math.hypot(x - 6, z - 6) <= r;
const shieldForm = box(0, 0, 0, 12, 0, 12, null).filter((v) => inDisc(v.x, v.z)).map((v) => ({ ...v, c: Math.floor(v.x / 2) % 2 ? SH.a : SH.b })); // tablas verticales de 2
const shieldStruct = [
  ...shieldForm.map((v) => (!inDisc(v.x, v.z, 5.4) ? { ...v, c: SH.rim } : v)), // llanta de hierro de 1 vóxel
  ...box(5, -1, 5, 7, -1, 7, SH.boss), { x: 6, y: -2, z: 6, c: SH.boss }, // umbo: la cúpula de metal del centro, que sobresale 2
  ...[[6, 1], [6, 11], [1, 6], [11, 6], [3, 3], [9, 9], [3, 9], [9, 3]].map(([x, z]) => ({ x, y: -1, z, c: SH.rimD })), // remaches sobre la llanta
];
const shieldFinal = [
  ...shieldStruct.map((v) => {
    if (v.y !== 0 || v.c === SH.rim) return v;
    const d = Math.abs(v.x - 6) - (12 - v.z) * 0.5; // galón: una V invertida pintada sobre la madera
    if (d > -1.2 && d < 0.8 && v.z >= 3) return { ...v, c: v.z >= 9 ? SH.paintL : SH.paint };
    return v;
  }).filter((v) => !(v.c === SH.rim && ((v.x === 9 && v.z === 11) || (v.x === 10 && v.z === 10)))) // una mella en la llanta, arriba a la derecha: ha parado golpes
    .filter((v) => !(v.y === -1 && v.x === 9 && v.z === 3)), // falta un remache: se ha saltado
  ...box(4, 1, 6, 8, 1, 6, WOOD.dark), ...box(4, 2, 6, 4, 2, 6, WOOD.dark), ...box(8, 2, 6, 8, 2, 6, WOOD.dark), ...box(4, 3, 6, 8, 3, 6, "#6b3d2e"), // asa detrás: dos soportes y la empuñadura
];

// ---------- OVEJA: un cuadrúpedo. Blockout de cajas, lana en volumen y cara con detalle
const SHEEP = { wool: "#f4ecdc", woolD: "#d8ccb4", face: "#3a3040", faceL: "#5a4a5e", hoof: "#2a2230", eye: "#ffffff", pink: "#e8a0a8" };
const sheepBlock = [
  ...box(0, 0, 4, 9, 5, 8, SHEEP.wool), // cuerpo: una caja de 10×6×5
  ...box(10, 1, 6, 13, 4, 10, SHEEP.face), // cabeza delante y más alta
  ...[[1, 0], [1, 4], [7, 0], [7, 4]].flatMap(([x, y]) => box(x, y, 0, x + 1, y + 1, 3, SHEEP.face)), // cuatro patas de 2×2
];
// lana: el cuerpo se redondea y se llena de bultos (bolas pequeñas que sobresalen 1 vóxel)
const woolBody = [];
for (let x = -1; x <= 10; x++) for (let y = -1; y <= 6; y++) for (let z = 3; z <= 10; z++) {
  const d = Math.hypot((x - 4.5) / 6, (y - 2.5) / 3.9, (z - 6.3) / 3.3);
  const bump = rnoise(x, y, z) % 5 === 0 ? 0.12 : 0;
  if (d <= 1 + bump) woolBody.push({ x, y, z, c: z <= 4 || rnoise(x + 1, y, z) % 7 === 0 ? SHEEP.woolD : SHEEP.wool });
}
const sheepHead = [...box(10, 1, 6, 13, 4, 10, SHEEP.face).filter((v) => !(v.x === 13 && v.z === 10)), ...box(9, 0, 9, 12, 5, 11, SHEEP.wool).filter((v) => v.x <= 11 || v.z === 11)]; // cabeza con un flequillo de lana encima
const sheepLegs = [[1, 0], [1, 4], [7, 0], [7, 4]].flatMap(([x, y]) => box(x, y, 0, x + 1, y + 1, 3, null).map((v) => ({ ...v, c: v.z === 0 ? SHEEP.hoof : SHEEP.face })));
const sheepWool = [...sheepLegs, ...woolBody, ...sheepHead];
const sheepFinal = [
  ...sheepWool,
  ...box(11, -1, 9, 12, -1, 9, SHEEP.face), ...box(11, 6, 9, 12, 6, 9, SHEEP.face), // orejas a los lados
  { x: 11, y: -1, z: 8, c: SHEEP.pink }, { x: 11, y: 6, z: 8, c: SHEEP.pink }, // el interior rosado de la oreja asoma por debajo
  { x: 14, y: 1, z: 8, c: SHEEP.eye }, { x: 14, y: 4, z: 8, c: SHEEP.eye }, // ojos delante
  { x: 14, y: 2, z: 6, c: SHEEP.faceL }, { x: 14, y: 3, z: 6, c: SHEEP.faceL }, // hocico más claro
  ...box(-2, 2, 7, -2, 3, 8, SHEEP.wool), // cola: una bola de lana detrás
];

// ---------- BARCO: un casco curvo hecho por capas, cubierta y mástil, vela y detalle
// Cada capa del casco es una «rodaja» horizontal: más estrecha abajo y afilada en la proa (x alto)
const HULL_L = 20;
const hullHalf = (x, z) => {
  const widthByZ = [1, 2, 3, 3.5][z]; // la quilla es estrecha; el casco se abre hacia arriba
  const bow = x > HULL_L - 6 ? (HULL_L - 1 - x) / 5 : 1; // proa: se afila en los últimos 6 vóxels
  const stern = x < 2 ? 0.85 : 1; // popa: un poco más recta
  return widthByZ * Math.max(0, bow) * stern;
};
const boatHull = [];
for (let x = 0; x < HULL_L; x++) for (let z = 0; z <= 3; z++) {
  const h = hullHalf(x, z);
  for (let y = -4; y <= 4; y++) if (Math.abs(y) <= h + 0.25 && (z > 0 || x > 1)) boatHull.push({ x, y, z, c: z === 3 ? WOOD.light : z % 2 ? WOOD.mid : WOOD.dark }); // tablas por hiladas
}
const hullShell = hollowOut(boatHull);
const deckZ = 4;
const boatDeck = [
  ...hullShell,
  ...boatHull.filter((v) => v.z === 3).map((v) => ({ ...v, z: deckZ, c: (v.x % 2 ? WOOD.light : "#c07a44") })), // cubierta de tablas transversales
  ...box(8, 0, deckZ + 1, 8, 0, deckZ + 14, WOOD.dark), // mástil de 14
  ...box(1, -2, deckZ + 1, 4, 2, deckZ + 3, WOOD.mid), ...box(1, -2, deckZ + 4, 4, 2, deckZ + 4, ROOF.dark), // camarote en la popa con tejado
];
const SAIL = "#f4ecdc", SAIL_S = "#c2413b";
const boatFinal = [
  ...boatDeck,
  // vela cuadrada, perpendicular al barco, colgada de una verga; una franja roja en medio
  ...box(8, -4, deckZ + 13, 8, 4, deckZ + 13, WOOD.dark),
  ...box(9, -4, deckZ + 6, 9, 4, deckZ + 12, null).map((v) => ({ ...v, c: v.z === deckZ + 9 ? SAIL_S : SAIL })),
  { x: 8, y: 0, z: deckZ + 15, c: SAIL_S }, { x: 7, y: 0, z: deckZ + 15, c: SAIL_S }, // banderín
  ...[[3, 3], [3, -3]].flatMap(([x, y]) => [{ x, y, z: deckZ + 1, c: WOOD.dark }]), // bolardos
  ...box(HULL_L - 1, 0, 3, HULL_L + 1, 0, 3, WOOD.dark), // bauprés: el palo que sale de la proa
  { x: 2, y: 0, z: deckZ + 5, c: "#ffd36e" }, // farol en el tejado del camarote
  ...[-3, 3].flatMap((y) => [6, 11, 14].map((x) => ({ x, y, z: deckZ + 1, c: WOOD.dark }))), // postes en la borda
];

// ---------- AO PINTADO: la habitación de V7-02 con oclusión ambiental pintada en los colores
// Solo las caras de ARRIBA visibles (suelo, tableros, asientos): cada una cuenta cuántos de los 8 huecos que la rodean
// justo por encima están ocupados. Junto a una pared recta salen 3; en un rincón, 5. Ahí la luz llega peor: un paso más oscuro
// (×0,82) a partir de 3 y dos pasos a partir de 5. Así el suelo se oscurece al pie de las paredes y junto a los muebles.
function bakeAO(voxels, { step = 0.82, t1 = 3, t2 = 5, onlyTops = true } = {}) {
  const occ = new Set(voxels.map((v) => `${v.x},${v.y},${v.z}`));
  return voxels.map((v) => {
    if (onlyTops && occ.has(`${v.x},${v.y},${v.z + 1}`)) return v; // tapado por arriba: esa cara no se ve
    let k = 0;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && occ.has(`${v.x + a},${v.y + b},${v.z + 1}`)) k++;
    const steps = k >= t2 ? 2 : k >= t1 ? 1 : 0;
    if (!steps) return v;
    const n = parseInt(v.c.slice(1), 16), f = step ** steps;
    return { ...v, c: "#" + [16, 8, 0].map((sh) => Math.round(((n >> sh) & 255) * f).toString(16).padStart(2, "0")).join("") };
  });
}
const aoRoom = bakeAO(roomDetail);
const aoTooMuch = bakeAO(roomDetail, { step: 0.55, t1: 1, t2: 3, onlyTops: false });

// ---------- TABERNA: un kit de muebles a la escala del chibi (15 de alto, cinturón en z=3, manos en z=3–5)
const tavTable = (x, y, z0, top, w = 10, d = 6) => [
  ...box(x, y, z0 + top, x + w - 1, y + d - 1, z0 + top, null).map((v) => ({ ...v, c: (v.x - x) % 3 === 2 ? WOOD.mid : WOOD.light })), // tablero de tablas
  ...[[x + 1, y + 1], [x + w - 2, y + 1], [x + 1, y + d - 2], [x + w - 2, y + d - 2]].flatMap(([a, b]) => box(a, b, z0, a, b, z0 + top - 1, WOOD.dark)), // patas metidas 1 vóxel
];
const tavChair = (x, y, z0, seat, back = "y+", s = 3) => {
  const v = [...box(x, y, z0 + seat, x + s - 1, y + s - 1, z0 + seat, WOOD.mid), ...[[x, y], [x + s - 1, y], [x, y + s - 1], [x + s - 1, y + s - 1]].flatMap(([a, b]) => box(a, b, z0, a, b, z0 + seat - 1, WOOD.dark))];
  const by = back === "y+" ? y + s - 1 : y; // respaldo
  v.push(...box(x, by, z0 + seat + 1, x + s - 1, by, z0 + seat + 4, WOOD.mid).map((q) => ({ ...q, c: q.z === z0 + seat + 4 ? WOOD.dark : WOOD.mid })));
  return v;
};
const tavBarrel = (cx, cy, z0, r = 2.6, h = 7) => move(cylinder(r, h, WOOD.mid), cx, cy, z0).map((v) => {
  const z = v.z - z0;
  if (z === 1 || z === h - 2) return { ...v, c: METAL.dark }; // aros
  if (z === h - 1 && Math.hypot(v.x - cx, v.y - cy) < r - 0.8) return { ...v, c: WOOD.light }; // tapa
  return Math.round(Math.atan2(v.y - cy, v.x - cx) * 3) % 2 === 0 ? { ...v, c: WOOD.dark } : v; // duelas
});
const tavMug = (x, y, z0, s = 2, h = 2) => [...box(x, y, z0, x + s - 1, y + s - 1, z0 + h - 1, "#8a8698"), ...box(x, y, z0 + h, x + s - 1, y + s - 1, z0 + h, "#f4ecdc"), ...box(x + s, y, z0 + 1, x + s, y, z0 + h - 1, "#6a6678")]; // jarra de estaño con espuma y asa
const tavKit = [
  ...chibiDetail,
  ...tavTable(13, 2, 0, 5),
  ...tavChair(26, 3, 0, 3),
  ...tavBarrel(35, 5, 0),
  ...tavMug(41, 4, 0),
];
const tavWrong = [
  ...chibiDetail,
  ...tavTable(13, 2, 0, 10), // la mesa a la altura de los ojos
  ...tavChair(26, 4, 0, 1, "y+", 2), // una silla de muñecas
  ...tavBarrel(36, 5, 0, 4.3, 14), // un barril casi tan alto como el héroe
  ...tavMug(15, 4, 11, 3, 4), // una jarra que es medio cabeza
];
const tavFloor = box(0, 0, 0, 27, 15, 0, null).map((v) => ({ ...v, c: v.y % 2 ? FLOOR.a : FLOOR.b })); // tablas a lo largo de X
const tavWalls = [
  ...box(0, 15, 1, 27, 15, 17, null).map((v) => ({ ...v, c: v.z <= 4 ? WOOD.dark : (v.x + (v.z % 2) * 2) % 4 === 0 ? STONE.dark : STONE.light })), // fondo: zócalo de madera y piedra encima
  ...box(0, 0, 1, 0, 14, 17, null).map((v) => ({ ...v, c: v.z <= 4 ? WOOD.dark : (v.y + (v.z % 2) * 2) % 4 === 0 ? STONE.dark : STONE.light })),
];
const tavCorner = [
  ...tavFloor, ...tavWalls,
  ...tavTable(7, 5, 1, 5),
  ...tavChair(10, 2, 1, 3, "y-"), ...tavChair(10, 11, 1, 3, "y+"), // dos sillas enfrentadas
  ...tavBarrel(4, 12, 1), ...tavBarrel(4, 6, 1), ...tavBarrel(4, 12, 8, 2.6, 6), // barriles contra la pared, uno encima
  ...box(1, 12, 3, 1, 12, 3, METAL.mid), // grifo del barril, por fuera de la duela
  ...tavMug(9, 7, 7), ...tavMug(14, 8, 7), // jarras sobre la mesa
  ...box(12, 7, 7, 12, 7, 7, "#f4e6c8"), { x: 12, y: 7, z: 8, c: "#ffd36e" }, // vela (Emit)
  ...box(8, 15, 8, 12, 15, 8, WOOD.dark).map((v) => ({ ...v, y: 14 })), // estante en la pared del fondo
  ...[[9, "#8a8698"], [11, "#c2413b"]].flatMap(([x, c]) => box(x, 14, 9, x, 14, 10, c)), // botella y jarra en el estante
  ...move(chibiDetail, 16, 5, 1), // el chibi de pie junto a la mesa: la mesa le llega por las manos
];

// ---------- GÓLEM: una criatura grande por masas, piezas y detalle (mira hacia -Y)
const GOLEM_PARTS = [
  ["pierna-i", [3, 2, 0, 6, 6, 7], "#8a8f9e"], ["pierna-d", [9, 2, 0, 12, 6, 7], "#8a8f9e"],
  ["cadera", [3, 1, 8, 12, 6, 9], "#7d8698"],
  ["torso", [1, 0, 10, 14, 7, 19], "#9aa3b5"],
  ["cabeza", [5, -2, 19, 10, 2, 23], "#a8b0c0"],
  ["hombro-i", [-2, 1, 17, 1, 6, 20], "#8a8f9e"], ["hombro-d", [14, 1, 17, 17, 6, 20], "#8a8f9e"],
  ["brazo-i", [-2, 2, 12, 0, 5, 16], "#7d8698"], ["brazo-d", [15, 2, 12, 17, 5, 16], "#7d8698"],
  ["puño-i", [-3, 0, 5, 1, 5, 10], "#9aa3b5"], ["puño-d", [14, 0, 5, 18, 5, 10], "#9aa3b5"],
];
const golemMass = GOLEM_PARTS.flatMap(([, b]) => box(...b, STONE.light));
const golemPieces = (() => {
  const v = [];
  for (const [name, [x0, y0, z0, x1, y1, z1], c] of GOLEM_PARTS) {
    for (const q of box(x0, y0, z0, x1, y1, z1, c)) {
      const corner = [q.x === x0 || q.x === x1, q.y === y0 || q.y === y1, q.z === z1].filter(Boolean).length === 3;
      if (corner && !name.startsWith("pierna")) continue; // esquinas de arriba desconchadas: piedra, no cajas
      const spot = ((q.x * 7 + q.y * 13 + q.z * 5) % 11) === 0;
      v.push(spot ? { ...q, c: "#6a6f7e" } : q);
    }
  }
  // articulaciones: codos de piedra oscura, más estrechos que el brazo
  v.push(...box(-2, 2, 11, 0, 5, 11, "#4a4e5c"), ...box(15, 2, 11, 17, 5, 11, "#4a4e5c"));
  return v;
})();
const GLOW = "#7df9ff", CORE = "#38b6ff";
const golemDetail = (() => {
  const top = new Map();
  for (const q of golemPieces) { const k = `${q.x},${q.y}`; if (!top.has(k) || top.get(k).z < q.z) top.set(k, q); }
  const moss = new Set([...top.values()].filter((q) => q.z >= 7 && ((q.x * 3 + q.y * 5 + q.z) % 5 < 2 || (q.z >= 20 && (q.x + q.y) % 2 === 0))).map((q) => `${q.x},${q.y},${q.z}`));
  const v = golemPieces.map((q) => (moss.has(`${q.x},${q.y},${q.z}`) ? { ...q, c: (q.x + q.y) % 3 ? LEAF.mid : LEAF.dark } : q));
  // musgo que cuelga 1 vóxel por el frente de los hombros
  for (const x of [-1, 16]) v.push({ x, y: 0, z: 20, c: LEAF.dark }, { x, y: 0, z: 19, c: LEAF.dark });
  // ojos que brillan (Emit) en la cara, y el núcleo de cristal en el pecho con grietas que salen de él
  for (const x of [6, 9]) v.push({ x, y: -2, z: 21, c: GLOW });
  v.push(...box(7, 0, 14, 8, 0, 15, CORE), { x: 7, y: -1, z: 15, c: GLOW });
  for (const [x, z] of [[6, 16], [5, 17], [4, 18], [9, 13], [10, 12], [6, 13]]) v.push({ x, y: 0, z, c: "#3a3e4a" });
  v.push({ x: 16, y: 3, z: 21, c: "#ffd36e" }, { x: 16, y: 4, z: 21, c: LEAF.light }); // una flor en el hombro
  return v;
})();

// ---------- FUENTE: piedra, agua (material Glass) y lo que se ve a través del agua
const WATER = { deep: "#2a6fc9", mid: "#3a8fd8", light: "#9fd8ff", foam: "#e8f6ff" };
const ring = (r0, r1, z0, z1, c) => { const v = []; const R = Math.ceil(r1); for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) { const d = Math.max(Math.abs(x), Math.abs(y), (Math.abs(x) + Math.abs(y)) / 1.4); if (d <= r1 && d > r0) for (let z = z0; z <= z1; z++) v.push({ x, y, z, c }); } return v; }; // octógono
const fountainStone = [
  ...ring(-1, 7, 0, 0, STONE.dark), // suelo del estanque
  ...ring(6, 7, 1, 3, STONE.light).map((v) => ({ ...v, c: v.z === 3 ? "#b4bccb" : (v.x + v.y + v.z) % 3 ? STONE.light : STONE.dark })), // pretil con remate claro
  ...ring(-1, 1, 1, 6, STONE.dark), // columna central
  ...ring(-1, 3, 7, 7, STONE.light), ...ring(2, 3, 8, 8, "#b4bccb"), // taza de arriba
  ...ring(-1, 0.9, 8, 9, STONE.dark), // caño
];
const fountainWater = [
  ...fountainStone,
  ...ring(1, 6, 2, 2, WATER.mid).map((v) => ({ ...v, c: (v.x * 3 + v.y * 5) % 7 === 0 ? WATER.light : WATER.mid })), // agua del estanque, 1 por debajo del remate
  ...ring(-1, 2, 8, 8, WATER.mid), // agua en la taza
  ...box(0, 0, 10, 0, 0, 11, WATER.light), { x: 0, y: 0, z: 12, c: WATER.foam }, // chorro
  ...[[3, 0], [-3, 0], [0, 3], [0, -3]].flatMap(([x, y]) => box(x + Math.sign(x), y + Math.sign(y), 3, x + Math.sign(x), y + Math.sign(y), 7, WATER.light)), // cuatro caños de agua que caen de la taza al estanque
];
const fountainDetail = [
  ...ring(-1, 7, 0, 0, STONE.dark),
  ...[[3, 2, GOLD.light], [-2, 4, GOLD.mid], [4, -3, GOLD.light], [-4, -2, METAL.light]].map(([x, y, c]) => ({ x, y, z: 1, c })), // monedas en el fondo: solo se ven si el agua es Glass
  ...[[-4, 3], [4, 4]].flatMap(([x, y]) => box(x, y, 1, x, y, 1, "#5c6676")), // piedras en el fondo
  ...fountainWater.filter((v) => v.z > 0),
  ...[[2, -4], [3, -4], [2, -5]].map(([x, y]) => ({ x, y, z: 2, c: LEAF.mid })), { x: 3, y: -5, z: 2, c: "#ff8fb0" }, // nenúfar con flor flotando
  ...ring(6, 7, 1, 1, LEAF.dark).filter((v) => (v.x * 5 + v.y * 3) % 4 === 0), // musgo en la base del pretil
  ...ring(7, 8, 0, 0, PATH.light).filter((v) => (v.x + v.y) % 5 !== 0), // empedrado alrededor, pegado al pretil
  ...[[0, 4], [0, -4], [4, 0], [-4, 0]].map(([x, y]) => ({ x, y, z: 3, c: WATER.foam })), // espuma donde cae el agua
];

// ---------- MOLINO: un cuerpo fijo y unas aspas que son otra pieza (se giran aparte)
const millBody = [
  ...box(0, 0, 0, 8, 8, 8, null).map((v) => ({ ...v, c: (v.x + 2 * (v.z % 2)) % 4 === 0 || v.z % 3 === 0 ? STONE.dark : STONE.light })), // base de piedra en hiladas
  ...box(1, 1, 9, 7, 7, 15, null).map((v) => ({ ...v, c: v.x % 2 ? WOOD.mid : WOOD.light })), // cuerpo de tablas, más estrecho
];
for (let k = 0; k < 4; k++) millBody.push(...box(k, k, 16 + k, 8 - k, 8 - k, 16 + k, k % 2 ? ROOF.dark : ROOF.light)); // tejado escalonado
millBody.push(...box(4, -1, 13, 4, 0, 13, WOOD.dark)); // eje que sale por delante
// aspas: cuatro brazos en el plano y = -2, alrededor del buje (4, 13)
const SAIL_C = "#f4ecdc";
const bladeArm = (pts) => [[0, 1], [-1, 0], [0, -1], [1, 0]].flatMap(([cx, sx], k) => pts.map(([a, b, c]) => {
  // giro de 90° en el plano XZ: (a, b) → (b, -a), k veces
  let [p, q] = [a, b];
  for (let i = 0; i < k; i++) [p, q] = [q, -p];
  return { x: 4 + p, y: -2, z: 13 + q, c };
}));
const straightArm = [...Array.from({ length: 9 }, (_, i) => [0, i + 1, WOOD.dark]), ...Array.from({ length: 7 }, (_, i) => [[1, i + 3, i % 2 ? WOOD.mid : SAIL_C], [2, i + 3, i % 2 ? WOOD.mid : SAIL_C]]).flat()];
const diagArm = [...Array.from({ length: 6 }, (_, i) => [i + 1, i + 1, WOOD.dark]), ...Array.from({ length: 4 }, (_, i) => [[i + 3, i + 2, SAIL_C], [i + 4, i + 2, i % 2 ? WOOD.mid : SAIL_C], [i + 4, i + 3, SAIL_C]]).flat()];
const hub = [{ x: 4, y: -2, z: 13, c: METAL.dark }];
const millCross = [...millBody, ...hub, ...bladeArm(straightArm),
  ...box(3, -1, 1, 5, -1, 4, WOOD.dark), { x: 5, y: -2, z: 2, c: GOLD.light }, // puerta con tirador
  ...box(2, 1, 11, 2, 1, 12, "#9fd8ff"), ...box(6, 1, 11, 6, 1, 12, "#9fd8ff"), // dos ventanas en la fachada
  ...[[10, 1], [10, 3], [11, 2]].flatMap(([x, y]) => box(x, y, 0, x, y, 1, "#e8d49a")), // sacos de harina junto a la base
];
const millDiag = [...millCross.filter((v) => v.y !== -2 || (v.z < 4 && v.x === 5)), ...hub, ...bladeArm(diagArm)];

// ---------- CARAS VOXEL: el chibi con expresiones hechas con 2–6 vóxels (la cara mira hacia -Y; ojos en y=1)
const EYE = "#1b1030", MOUTH = "#a8484f", BLUSH = "#f29b9b";
const chibiNoEyes = chibiDetail.filter((v) => v.y !== 1);
const faceHappy = [
  ...chibiNoEyes,
  ...[[3, 9], [4, 10], [5, 9], [6, 9], [7, 10], [8, 9]].map(([x, z]) => ({ x, y: 1, z, c: EYE })), // ojos cerrados en arco: ^ ^
  { x: 5, y: 1, z: 7, c: MOUTH }, { x: 6, y: 1, z: 7, c: MOUTH }, // boca
  { x: 3, y: 2, z: 8, c: BLUSH }, { x: 8, y: 2, z: 8, c: BLUSH }, // mejillas pintadas en la cara (no sobresalen)
];
const faceAngry = [
  ...chibiDetail,
  { x: 3, y: 1, z: 12, c: EYE }, { x: 4, y: 1, z: 11, c: EYE }, { x: 8, y: 1, z: 12, c: EYE }, { x: 7, y: 1, z: 11, c: EYE }, // cejas: altas por fuera, bajas por dentro
  { x: 5, y: 1, z: 7, c: EYE }, { x: 6, y: 1, z: 7, c: EYE }, // boca recta y oscura
];
const faceTooMuch = [
  ...chibiNoEyes,
  ...[[3, 9], [4, 9], [3, 10], [4, 10], [7, 9], [8, 9], [7, 10], [8, 10]].map(([x, z]) => ({ x, y: 1, z, c: (x === 4 || x === 7) && z === 10 ? "#3b6fd1" : x === 4 || x === 7 ? "#26489a" : "#ffffff" })), // ojos de 2×2 con blanco e iris
  ...[[3, 11], [4, 11], [7, 11], [8, 11]].map(([x, z]) => ({ x, y: 1, z, c: "#6b3d2e" })), // cejas
  { x: 5, y: 0, z: 8, c: "#c98f6b" }, { x: 6, y: 0, z: 8, c: "#c98f6b" }, { x: 5, y: 1, z: 8, c: "#e0a880" }, { x: 6, y: 1, z: 8, c: "#e0a880" }, // nariz que sobresale 2
  ...[4, 5, 6, 7].map((x) => ({ x, y: 1, z: 7, c: x === 4 || x === 7 ? "#8a3a40" : "#c2414b" })), // labios de 4
  ...[[3, 8], [8, 8], [3, 7], [8, 7]].map(([x, z]) => ({ x, y: 2, z, c: z === 8 ? "#e8b090" : "#d89878" })), // sombreado de mejillas en dos tonos
];

// ---------- CUEVA: masa de roca → vaciar la cámara y la entrada → cristales, estalactitas y luz
const CAVE = { a: "#7d8698", b: "#6a7284", c: "#565d6e", in: "#3e4352", floor: "#5c5248", floorD: "#4a4238" };
const caveTop = (x, y) => 10 + (rnoise(x, y, 7) % 4) - (x < 2 || x > 19 || y > 13 ? 2 : 0);
const caveMass = [];
for (let x = 0; x <= 21; x++) for (let y = 0; y <= 15; y++) {
  if ((x === 0 || x === 21) && rnoise(x, y, 3) < 35) continue; // bordes de los lados irregulares (la pared del fondo, entera: tapa la cámara)
  const t = caveTop(x, y);
  for (let z = 0; z <= t; z++) caveMass.push({ x, y, z, c: z === 0 ? CAVE.c : (z + Math.floor(rnoise(x, y, 1) / 50)) % 4 === 0 ? CAVE.b : CAVE.a }); // estratos
}
const carved = (x, y, z) => z >= 1 && (((x - 11) / 8) ** 2 + ((y - 9) / 4.8) ** 2 + ((z - 1) / 6.5) ** 2 < 1 || (y <= 7 && ((x - 9) / 4.5) ** 2 + ((z - 1) / 6) ** 2 < 1)); // cámara y entrada en arco
const isCarved = (v) => carved(v.x, v.y, v.z);
const caveHollow = (() => {
  const keep = caveMass.filter((v) => !isCarved(v));
  return keep.filter((v) => v.x <= 14).map((v) => { // en corte: se quita la parte derecha (x > 14) para ver dentro
    const touches = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].some(([a, b, c]) => carved(v.x + a, v.y + b, v.z + c));
    if (v.z === 0 && carved(v.x, v.y, 1)) return { ...v, c: (v.x + v.y) % 3 ? CAVE.floor : CAVE.floorD }; // suelo de tierra dentro
    return touches ? { ...v, c: CAVE.in } : v; // las paredes de dentro, más oscuras: les llega menos luz
  });
})();
const CRY = { c1: "#7df9ff", c2: "#38b6ff", p1: "#c08aff", p2: "#8a4fd8" };
const crystal = (x, y, h, lean, [hi, lo]) => Array.from({ length: h }, (_, k) => ({ x: x + (k >= 2 ? lean : 0), y, z: 1 + k, c: k === h - 1 ? hi : lo }));
const ceilingZ = (x, y) => { let z = 1; while (carved(x, y, z + 1)) z++; return z + 1; };
const caveFinal = [
  ...caveHollow,
  ...crystal(5, 11, 4, 1, [CRY.c1, CRY.c2]), ...crystal(6, 12, 2, 0, [CRY.c1, CRY.c2]), ...crystal(4, 10, 3, 0, [CRY.c1, CRY.c2]), // grupo de cristales azules
  ...crystal(13, 13, 3, 0, [CRY.p1, CRY.p2]), ...crystal(12, 12, 2, 0, [CRY.p1, CRY.p2]), // grupo morado, más pequeño
  ...[[9, 10, 2], [13, 9, 3], [11, 12, 1], [12, 6, 2]].flatMap(([x, y, n]) => Array.from({ length: n }, (_, k) => ({ x, y, z: ceilingZ(x, y) - 1 - k, c: k === n - 1 ? CAVE.c : CAVE.b }))), // estalactitas
  ...[[8, 4], [13, 4]].flatMap(([x, y]) => [{ x, y, z: 1, c: "#e8dcc0" }, { x, y, z: 2, c: "#7dffb0" }]), // setas que brillan junto a la entrada
  ...[[12, 9], [13, 9], [14, 9], [13, 10]].map(([x, y]) => ({ x, y, z: 0, c: "#2a6fc9" })), // charco bajo la estalactita más larga (gotea)
];


// ---------- VALLA: una pieza que se duplica y se gira 90° (seleccionar, mover, rotar, duplicar)
const dedupe = (vox) => [...new Map(vox.map((v) => [`${v.x},${v.y},${v.z}`, v])).values()]; // si dos vóxels coinciden, gana el último
const fencePost = (h = 7) => [...box(0, 0, 0, 1, 1, h - 1, WOOD.dark), ...box(0, 0, h, 1, 1, h, WOOD.mid)]; // poste de 2×2 con la cabeza más clara
const fenceModule = (h = 7) => [...fencePost(h), ...box(2, 0, 2, 7, 0, 2, WOOD.light), ...box(2, 0, 5, 7, 0, 5, WOOD.light)]; // poste + dos travesaños de 6
const rotZ = (vox) => vox.map((v) => ({ ...v, x: -v.y, y: v.x })); // giro de 90° alrededor del eje Z
const fenceOne = fenceModule();
const fenceRow = dedupe([0, 8, 16, 24].flatMap((x) => move(fenceModule(), x, 0, 0)).concat(move(fencePost(), 32, 0, 0)));
const fenceTurn = (mods) => dedupe([
  ...[0, 8, 16].flatMap((x) => move(mods(x / 8), x, 0, 0)),
  ...[0, 8].flatMap((y, i) => move(rotZ(mods(3 + i)), 25, y, 0)), // el mismo módulo girado 90°: los travesaños van ahora a lo largo de Y
  ...move(fencePost(), 24, 16, 0),
]);
const fenceCorner = fenceTurn(() => fenceModule());
const fenceVaried = (() => {
  const H = [7, 8, 6, 7, 8]; // alturas de poste distintas
  const v = fenceTurn((i) => fenceModule(H[i])).filter((q) => !(q.y === 0 && q.z === 5 && q.x >= 11 && q.x <= 13)); // un travesaño roto
  v.push(...box(11, -2, 0, 13, -2, 0, WOOD.light)); // el trozo roto, en el suelo
  v.push(...box(18, 0, 2, 23, 0, 2, null).map((q) => ({ ...q, c: q.x % 2 ? "#a89880" : "#968670" }))); // una tabla cambiada, de madera vieja y gris
  for (const [x, y] of [[0, -1], [1, 2], [8, -1], [17, 2], [24, -1], [26, 9], [23, 8], [26, 15]]) v.push({ x, y, z: 0, c: LEAF.mid }, { x, y, z: 1, c: LEAF.light }); // hierba al pie de los postes
  v.push({ x: 5, y: -1, z: 0, c: LEAF.dark }, { x: 5, y: -1, z: 1, c: "#ffd36e" }); // una flor
  v.push(...box(29, 4, 0, 30, 5, 0, STONE.dark), { x: 29, y: 4, z: 1, c: STONE.light }); // una piedra
  return dedupe(v);
})();

// ---------- ROCAS: de cajas a rocas (facetas, tres tamaños, color por orientación)
const RK = { l: "#b0abc4", m: "#8a8698", d: "#64607a", dd: "#45425a" };
const ROCKS = [
  { b: [0, 0, 0, 9, 7, 7], cut: [3, 2, 1, 3, 2, 1, 2, 3] }, // grande
  { b: [9, 2, 0, 14, 6, 4], cut: [1, 2, 2, 1, 1, 2, 1, 1] }, // mediana, apoyada en la grande
  { b: [-4, 5, 0, -2, 7, 2], cut: [1, 1, 0, 1, 1, 0, 1, 1] }, // pequeña, separada
];
const rockBlocks = dedupe(ROCKS.flatMap(({ b }) => box(...b, RK.m)));
const facet = ({ b: [x0, y0, z0, x1, y1, z1], cut: [a, bb, c, d, e, f, g, hh] }) => box(x0, y0, z0, x1, y1, z1, RK.m).filter((v) => {
  const top = z1 - v.z; // distancia al techo
  // aristas de arriba cortadas en bisel, cada una con su ancho (no todas iguales: así no parece una caja con chaflán)
  if (v.x - x0 + top < a || x1 - v.x + top < bb || v.y - y0 + top < c || y1 - v.y + top < d) return false;
  // esquinas verticales, también desiguales
  if (v.x - x0 + v.y - y0 < e || x1 - v.x + v.y - y0 < f || v.x - x0 + y1 - v.y < g || x1 - v.x + y1 - v.y < hh) return false;
  return true;
});
const rockFacets = dedupe([...ROCKS.flatMap(facet), ...box(3, 1, 8, 5, 4, 8, RK.m).filter((v) => v.x - 3 + v.y - 1 > 0)]); // un saliente arriba: el techo no es plano
// grietas: tramos de 2–3 vóxels en zigzag por las caras que se ven, por debajo de los biseles
const CRACKS = new Set([[2, 0, 4], [3, 0, 5], [6, 0, 4], [7, 0, 3], [6, 0, 2], [9, 1, 4], [9, 2, 3], [9, 1, 2], [13, 3, 2], [13, 3, 1], [14, 4, 0]].map((p) => p.join(","))); // dos en el frente de la grande, una en su lado derecho y otra en el de la mediana
const rockDetail = (() => {
  const s = new Set(rockFacets.map((v) => `${v.x},${v.y},${v.z}`));
  const has = (x, y, z) => s.has(`${x},${y},${z}`);
  const v = rockFacets.map((q) => {
    const up = !has(q.x, q.y, q.z + 1), front = !has(q.x, q.y - 1, q.z), right = !has(q.x + 1, q.y, q.z);
    let c = up ? RK.l : front ? RK.m : right ? "#76728a" : RK.d; // la luz viene de arriba y un poco de delante
    if (!up && (front || right) && CRACKS.has(`${q.x},${q.y},${q.z}`)) c = RK.dd; // grietas: líneas cortas en las caras que se ven
    if (up && q.z >= 2 && rnoise(q.x, q.y, q.z) < 40) c = (q.x + q.y) % 3 ? "#6f9a5c" : "#557a48"; // musgo apagado arriba, donde llueve
    return { ...q, c };
  });
  for (const [x, y] of [[-1, 1], [11, -1], [15, 3], [3, -1], [-3, 4]]) v.push({ x, y, z: 0, c: RK.m }); // piedrecitas sueltas
  for (const [x, y, t] of [[-1, -1, 1], [0, -1, 0], [7, -1, 0], [13, 7, 1], [-1, 6, 0], [15, 1, 0], [15, 2, 1]]) { v.push({ x, y, z: 0, c: LEAF.dark }); if (t) v.push({ x, y, z: 1, c: LEAF.mid }); } // matas de hierba al pie, bajas
  return dedupe(v);
})();


// ---------- POZO: formas redondas en una rejilla (círculos de diámetro impar, anillo de piedra, tejado y cubo)
const disc = (r, c, z = 0) => { const v = []; const R = Math.ceil(r); for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) if (x * x + y * y <= r * r) v.push({ x, y, z, c }); return v; };
const discEven = (d, c) => { const v = []; const h = d / 2; for (let x = 0; x < d; x++) for (let y = 0; y < d; y++) if ((x + 0.5 - h) ** 2 + (y + 0.5 - h) ** 2 <= h * h) v.push({ x: x - h, y: y - h, z: 0, c }); return v; }; // centro entre vóxels
const wellCircles = [
  ...move(disc(4, STONE.dark), -12, 0, 0), // radio 4 justo: un vóxel suelto en cada punta
  ...disc(4.5, STONE.light), // radio 4,5: diámetro 9, borde limpio
  ...move(discEven(8, STONE.dark), 11, 0, 0), // diámetro 8: no tiene vóxel central
];
const wellStone = (x, y, z) => { const a = Math.atan2(y, x) + Math.PI, seg = Math.floor((a / (2 * Math.PI)) * 11 + (z % 2) * 0.5); return (seg + z) % 3 === 0 ? STONE.dark : rnoise(seg, z, 5) < 40 ? "#8a93a5" : STONE.light; }; // sillares en hiladas alternas
const wellRing = [];
for (let z = 0; z <= 4; z++) for (const v of disc(4.5, null)) if (v.x * v.x + v.y * v.y > 2.5 * 2.5) wellRing.push({ ...v, z, c: z === 4 ? "#b4bccb" : wellStone(v.x, v.y, z) });
const wellWater = [...disc(2.5, "#2f3442", 0), ...disc(2.5, WATER.deep, 1).map((v) => ({ ...v, c: (v.x + v.y) % 3 === 0 ? WATER.mid : WATER.deep }))]; // fondo oscuro y agua 3 por debajo del brocal
const wellBody = [...wellRing, ...wellWater];
const wellRoofPart = [];
for (let k = 0; k <= 4; k++) for (let x = -5; x <= 5; x++) for (const y of k === 4 ? [0] : [-(4 - k), 4 - k, -(3 - k), 3 - k].filter((q, i, a) => a.indexOf(q) === i)) wellRoofPart.push({ x, y, z: 12 + k, c: k === 4 ? ROOF.dark : (x + k) % 2 ? ROOF.light : ROOF.dark }); // tejado a dos aguas, a lo largo de X
const wellFinal = dedupe([
  ...wellRoofPart,
  ...wellBody,
  ...box(-4, 0, 5, -4, 0, 15, WOOD.dark), ...box(4, 0, 5, 4, 0, 15, WOOD.dark), // dos postes sobre el brocal, hasta la cumbrera
  ...box(-3, 0, 9, 3, 0, 9, WOOD.mid), // el torno
  ...box(5, 0, 9, 5, 0, 9, METAL.mid), ...box(6, 0, 9, 6, 1, 9, METAL.mid), // manivela que sale por fuera
  ...box(0, 0, 6, 0, 0, 8, "#e8d49a"), // la cuerda, hasta el asa del cubo
  ...box(-1, -1, 5, 1, 1, 6, WOOD.mid).filter((v) => !(v.x === 0 && v.y === 0 && v.z === 6)).map((v) => ({ ...v, c: v.z === 6 ? METAL.dark : WOOD.mid })), // el cubo, con aro de metal
  ...box(6, 3, 0, 7, 4, 1, WOOD.mid).filter((v) => !(v.z === 1 && v.x === 6 && v.y === 3)), { x: 6, y: 3, z: 1, c: WATER.mid }, // otro cubo en el suelo, lleno
  ...disc(5.5, null).filter((v) => v.x * v.x + v.y * v.y > 4.5 * 4.5 && rnoise(v.x, v.y, 2) < 55).map((v) => ({ ...v, c: (v.x + v.y) % 2 ? LEAF.mid : LEAF.dark })), // hierba al pie, a manchas
  ...[[-5, -2], [-3, 5], [2, -5]].flatMap(([x, y]) => [{ x, y, z: 0, c: LEAF.mid }, { x, y, z: 1, c: LEAF.light }]),
]); // el tejado va primero: donde coincide con la punta de un poste, gana la madera

// ---------- GALLINA: un animal de dos patas (mira hacia +X, como la oveja)
const HEN = { w: "#f4ecdc", s: "#d8ccb4", f: "#c9b89a", r: "#d8343f", y: "#f2b33d", Y: "#d49a2a", e: "#1b1030" };
const henBlock = [
  ...box(-4, -3, 2, 4, 3, 8, HEN.s), // cuerpo
  ...box(3, -1, 9, 5, 1, 11, HEN.s), // cabeza encima de la pechuga
  ...box(-6, -1, 6, -5, 1, 10, HEN.s), // cola
  ...box(0, -1, 0, 0, -1, 1, HEN.y), ...box(0, 1, 0, 0, 1, 1, HEN.y), // patas
];
const henBodyShape = [];
for (let x = -5; x <= 5; x++) for (let y = -3; y <= 3; y++) for (let z = 2; z <= 8; z++) if ((x / 4.6) ** 2 + (y / 3.2) ** 2 + ((z - 5) / 3.3) ** 2 <= 1) henBodyShape.push({ x, y, z, c: HEN.w });
const henHead = box(3, -1, 9, 5, 1, 11, HEN.w).filter((v) => !((v.x === 3 || v.x === 5) && v.z === 11 && v.y !== 0)); // esquinas de arriba fuera
const henNeck = box(2, -1, 8, 4, 1, 8, HEN.w); // el cuello arranca del lomo, sin muesca
const henRump = box(-4, -1, 7, -4, 1, 8, HEN.w); // la rabadilla: une la cola con el cuerpo
const henTail = [...box(-5, -1, 6, -5, 1, 9, HEN.w), ...box(-6, -1, 8, -6, 1, 11, HEN.w), { x: -7, y: 0, z: 11, c: HEN.w }, { x: -7, y: 0, z: 10, c: HEN.w }]; // abanico que sube hacia atrás
const henLegs = [[-1], [1]].flatMap(([y]) => [{ x: 0, y, z: 0, c: HEN.y }, { x: 0, y, z: 1, c: HEN.y }, { x: 1, y, z: 0, c: HEN.Y }, { x: -1, y, z: 0, c: HEN.Y }]); // patas de 1 vóxel y dedos delante y detrás
const henForm = dedupe([...henBodyShape, ...henNeck, ...henRump, ...henHead, ...henTail, ...henLegs]);
const henFinal = (() => {
  const v = henForm.map((q) => {
    if (q.c !== HEN.w) return q;
    const body = q.x >= -5 && q.x <= 5 && q.z >= 2 && q.z <= 8 && !(q.x >= 3 && q.z === 8);
    if (body && q.z <= 3) return { ...q, c: HEN.s }; // la tripa, en sombra
    if (body && Math.abs(q.y) >= 2 && q.x >= -3 && q.x <= 2 && q.z >= 4 && q.z <= 6) return { ...q, c: q.z === 4 || (q.x + q.z) % 3 === 0 ? HEN.f : HEN.s }; // ala plegada a cada lado, con plumas marcadas
    if (q.x <= -6 && q.z >= 10) return { ...q, c: HEN.f }; // puntas de la cola
    return q;
  });
  v.push({ x: 3, y: 0, z: 12, c: HEN.r }, { x: 4, y: 0, z: 12, c: HEN.r }, { x: 5, y: 0, z: 12, c: HEN.r }, { x: 3, y: 0, z: 13, c: HEN.r }, { x: 5, y: 0, z: 13, c: HEN.r }); // cresta con dos picos
  v.push({ x: 6, y: 0, z: 10, c: HEN.y }, { x: 5, y: 0, z: 8, c: HEN.r }); // pico y barbilla
  v.push({ x: 4, y: -1, z: 10, c: HEN.e }, { x: 4, y: 1, z: 10, c: HEN.e }); // un ojo a cada lado
  v.push(...[[8, 1], [9, -1], [7, -2], [10, 1]].map(([x, y]) => ({ x, y, z: 0, c: "#e8d49a" }))); // grano en el suelo, delante del pico
  return dedupe(v);
})();

export const MODELS = {
  pozo: {
    description: "Pozo: círculos y cilindros en una rejilla",
    stages: [
      { label: "Círculos", note: "Tres discos de 1 vóxel de alto. A la izquierda, radio 4 justo: en cada punta queda un vóxel suelto. En el centro, radio 4,5 (diámetro 9): borde limpio y un vóxel en el centro. A la derecha, diámetro 8: también redondo, pero sin vóxel central.", voxels: wellCircles },
      { label: "Brocal", note: "El disco de diámetro 9 subido 5 de alto y vaciado por dentro con un hueco de diámetro 5: un anillo de 2 de grueso. Los sillares van en hiladas alternas, el remate es más claro y dentro hay agua 3 vóxels por debajo del borde.", voxels: wellBody },
      { label: "Tejado y cubo", note: "Dos postes sobre el brocal, un torno con manivela, un tejado a dos aguas a lo largo de X, la cuerda y el cubo colgando sobre el agua. Al pie, otro cubo lleno, hierba a manchas y unas matas.", voxels: wellFinal },
    ],
  },
  gallina: {
    description: "Gallina: un animal de dos patas",
    stages: [
      { label: "Masas", note: "Cuatro cajas: un cuerpo de 9×7×7, una cabeza de 3×3×3 encima de la parte de delante, una cola detrás y dos patas de 1 vóxel. Mira hacia +X, como la oveja.", voxels: henBlock },
      { label: "Forma", note: "El cuerpo pasa a ser un huevo tumbado, la cabeza pierde las esquinas de arriba y la cola se abre en abanico hacia atrás y hacia arriba. Las patas son finas, con un dedo delante y otro detrás: dos apoyos bastan si el cuerpo queda encima.", voxels: henForm },
      { label: "Color y detalle", note: "Plumas blancas y la tripa en sombra; un ala plegada a cada lado, con las plumas marcadas; las puntas de la cola más oscuras. Cresta roja con dos picos, pico amarillo, barbilla roja, un ojo a cada lado y grano en el suelo.", voxels: henFinal },
    ],
  },

  valla: {
    description: "Valla: una pieza que se duplica, se mueve y se gira",
    stages: [
      { label: "Una pieza", note: "El módulo de la valla: un poste de 2×2 y 8 de alto con la cabeza más clara, y dos travesaños de 6 a z=2 y z=5. Mide 8 de largo justo: el poste de la copia siguiente cierra los travesaños.", voxels: fenceOne },
      { label: "Duplicada", note: "La pieza duplicada cuatro veces, cada copia movida 8 vóxels en X, y un poste suelto al final para cerrar. 34 de largo sin dibujar nada nuevo.", voxels: fenceRow },
      { label: "Esquina", note: "Tres copias a lo largo de X y dos más giradas 90° alrededor del eje Z, a lo largo de Y. Girar 90° es exacto en vóxels: la pieza no se deforma.", voxels: fenceCorner },
      { label: "Variada", note: "Las mismas copias con pequeños cambios: postes de 7, 8 y 9 de alto, un travesaño roto con el trozo en el suelo, una tabla cambiada de madera vieja y gris, hierba al pie de los postes, una flor y una piedra. Ya no se ve que es la misma pieza repetida.", voxels: fenceVaried },
    ],
  },
  rocas: {
    description: "Rocas: de tres cajas a un grupo de rocas",
    stages: [
      { label: "Cajas", note: "Tres cajas de tres tamaños: una grande de 10×8×8, una mediana de 6×5×5 apoyada en ella y una pequeña de 3×3×3 algo separada. El grupo ya funciona por tamaños antes de tener forma de roca.", voxels: rockBlocks },
      { label: "Facetas", note: "Cada caja con las aristas de arriba y las esquinas verticales cortadas en bisel, cada una con un ancho distinto (de 0 a 3), y un saliente encima de la grande. Ya no son cajas, y tampoco bolas: las rocas tienen caras planas.", voxels: rockFacets },
      { label: "Color y detalle", note: "El color sale de hacia dónde mira cada cara: lo de arriba, claro; el frente, medio; el lado derecho, más oscuro, y lo de detrás, el más oscuro de todos. Unas grietas oscuras, musgo a manchas solo en lo alto, piedrecitas sueltas y hierba al pie.", voxels: rockDetail },
    ],
  },
  caras: {
    description: "Caras voxel: el chibi con expresiones de pocos vóxels",
    stages: [
      { label: "Neutral", note: "El chibi de V5-01 tal cual: dos ojos de 1×2 que sobresalen 1 vóxel de la cara. Es la referencia: todo lo demás cambia solo unos pocos vóxels.", voxels: chibiDetail },
      { label: "Alegre", note: "Los ojos pasan a ser dos arcos de 3 vóxels (como ^ ^), una boca de 2 vóxels rosa oscuro y dos mejillas pintadas en la cara, sin sobresalir. Diez vóxels cambiados.", voxels: faceHappy },
      { label: "Enfado", note: "Los mismos ojos de la neutral con dos cejas de 2 vóxels, altas por fuera y bajas por dentro, y la boca recta y oscura. Seis vóxels añadidos.", voxels: faceAngry },
      { label: "Demasiado", note: "Error: la cara «realista» en un chibi: ojos de 2×2 con blanco e iris, cejas, una nariz que sobresale 2, labios de 4 en dos tonos y mejillas sombreadas. Con más vóxels no se lee mejor: la cara se vuelve rara y pierde el estilo.", voxels: faceTooMuch },
    ],
  },
  cueva: {
    description: "Cueva: vaciar una masa de roca y llenarla de luz",
    stages: [
      { label: "Masa", note: "Un bloque de roca de 22×16 y de 9 a 14 de alto, con la parte de arriba irregular, los bordes mordidos y estratos de piedra en dos tonos. Es la materia de la que se saca la cueva.", voxels: caveMass },
      { label: "Vaciado", note: "Se vacía una cámara redondeada dentro y una entrada en arco por delante, y se deja en corte (sin la parte derecha) para poder ver dentro, como la habitación de V7-02. El suelo de dentro pasa a tierra en dos tonos y las paredes que tocan el hueco se oscurecen: dentro llega menos luz.", voxels: caveHollow },
      { label: "Cristales y luz", note: "Dos grupos de cristales que crecen del suelo, uno azul junto a la pared del fondo a la izquierda y otro morado más pequeño al fondo, junto al corte (para el material Emit), cuatro estalactitas que cuelgan del techo, un charco bajo la más larga y dos setas que brillan junto a la entrada: la luz guía hacia dentro.", voxels: caveFinal },
    ],
  },
  fuente: {
    description: "Fuente: piedra, agua con material Glass y lo que se ve a través",
    stages: [
      { label: "Piedra", note: "Un estanque octogonal de 15 de ancho con un pretil de 3 de alto y remate claro, una columna central, una taza arriba y el caño. Toda la estructura en piedra, sin agua.", voxels: fountainStone },
      { label: "Agua", note: "Una capa de agua en el estanque, 1 vóxel por debajo del remate, con algunos vóxels más claros; agua en la taza, un chorro que sube 3 vóxels con espuma arriba y cuatro caños que caen de la taza al estanque.", voxels: fountainWater },
      { label: "Detalle", note: "Bajo el agua, cuatro monedas y dos piedras en el fondo: con colores opacos no se ven desde arriba; con el agua en material Glass, sí. Un nenúfar con flor, espuma donde cae el agua, musgo en la base del pretil y un empedrado alrededor.", voxels: fountainDetail },
    ],
  },
  molino: {
    description: "Molino: un cuerpo fijo y unas aspas que son otra pieza",
    stages: [
      { label: "Cuerpo", note: "Una base de piedra de 9×9×9 en hiladas, un cuerpo de tablas más estrecho (7×7×7), un tejado de cuatro escalones y el eje que sale por delante. Es la parte que nunca se mueve.", voxels: millBody },
      { label: "Aspas en cruz", note: "Cuatro brazos de 9 vóxels en cruz delante de la fachada, con velas de tela y travesaños alternos, una puerta con tirador, dos ventanas y unos sacos de harina. Las aspas van en un plano propio, separadas 1 vóxel de la fachada: en MagicaVoxel serían otro modelo.", voxels: millCross },
      { label: "Aspas a 45°", note: "Las mismas aspas giradas 45°, redibujadas en diagonal: los brazos quedan en escalera y las velas cambian de forma. Girar 90° es exacto en vóxels; 45° no, hay que volver a dibujar.", voxels: millDiag },
    ],
  },
  taberna: {
    description: "Taberna: un kit de muebles a la escala del personaje",
    stages: [
      { label: "Kit a escala", note: "El chibi de 15 vóxels como referencia y, a su lado, el kit: una mesa de 10×6 con el tablero a 5 de alto (por las manos), una silla con el asiento a 3 y respaldo, un barril de 7 de alto (por el pecho) y una jarra de 2×2×2 con espuma y asa.", voxels: tavKit },
      { label: "Sin escala", note: "Error: las mismas piezas sin medir contra el personaje. La mesa llega a la altura de los ojos, la silla es de muñecas, el barril de 14 de alto es casi tan alto como el héroe y la jarra es como media cabeza.", voxels: tavWrong },
      { label: "Rincón", note: "El kit montado en un rincón de taberna con suelo de tablas y paredes de piedra con zócalo de madera: la mesa con dos sillas enfrentadas, tres barriles contra la pared (uno encima, con grifo), dos jarras y una vela, un estante con botella y el chibi de pie junto a la mesa.", voxels: tavCorner },
    ],
  },
  golem: {
    description: "Gólem: una criatura grande por masas, piezas y detalle",
    stages: [
      { label: "Masas", note: "Once cajas en un solo gris: piernas gruesas de 4×5×8, un torso de 14×8×10, hombros enormes, brazos largos con puños de 5×6×6 que cuelgan hasta las rodillas y la cabeza pequeña y adelantada. Con las proporciones ya se lee pesado y fuerte.", voxels: golemMass },
      { label: "Piezas", note: "Cada masa es un bloque de piedra con su propio gris, las esquinas de arriba desconchadas y algunas manchas oscuras. Entre brazo y puño, una junta de piedra oscura (el codo), más estrecha que el puño: se ve que el cuerpo está hecho de piedras unidas.", voxels: golemPieces },
      { label: "Detalle", note: "Musgo a manchas en lo que mira hacia arriba (más en hombros y cabeza, algo en los puños) y colgando por delante de los hombros, dos ojos y un núcleo de cristal en el pecho (para el material Emit), grietas que salen del núcleo y una flor en el hombro derecho: lleva mucho tiempo quieto.", voxels: golemDetail },
    ],
  },
  barco: {
    description: "Barco: casco curvo por capas, cubierta y mástil, vela y detalle",
    stages: [
      { label: "Casco", note: "Cuatro capas horizontales: la quilla estrecha abajo y cada capa más ancha, con la proa afilada en los últimos 6 vóxels y la popa más recta. Las tablas se leen por hiladas (cuatro hiladas en tres tonos). Vaciado por dentro: se ve con el corte por capas.", voxels: hullShell },
      { label: "Cubierta y mástil", note: "La cubierta con tablas transversales en dos tonos, un mástil de 14 vóxels algo desplazado hacia la popa (no parte el barco por la mitad) y un camarote en la popa con tejado rojo.", voxels: boatDeck },
      { label: "Vela y detalle", note: "Una vela cuadrada de 9×7 colgada de la verga, perpendicular al barco, con una franja roja; un banderín arriba, el bauprés en la proa, bolardos, seis postes en la borda y un farol en el camarote.", voxels: boatFinal },
    ],
  },
  ao: {
    description: "AO pintado: la habitación de V7-02 con oclusión ambiental en los colores",
    stages: [
      { label: "Sin AO", note: "La habitación terminada de V7-02, con colores planos: el suelo junto a las paredes y bajo los muebles es igual de claro que en medio de la sala.", voxels: roomDetail },
      { label: "AO pintado", note: "Cada cara de arriba visible mira los 8 huecos que la rodean por encima: junto a una pared o un mueble (3 o más ocupados) se oscurece un paso (×0,82); en un rincón (5 o más), dos. Se oscurecen el pie de las paredes, los lados de la cama y el contorno de la alfombra, y llevan dos pasos los rincones entre pared y cama y entre cama y alfombra: los objetos se asientan.", voxels: aoRoom },
      { label: "Exagerado", note: "Error: el mismo cálculo con pasos de ×0,55, umbrales más bajos y aplicado a todos los vóxels, también a las paredes. Casi todo se oscurece, los rincones son manchas negras y la habitación parece sucia, no iluminada.", voxels: aoTooMuch },
    ],
  },
  oveja: {
    description: "Oveja: un cuadrúpedo en tres pasos",
    stages: [
      { label: "Blockout", note: "Tres cajas y cuatro patas: un cuerpo de 10×6×5, una cabeza más alta delante y patas de 2×2 en las esquinas. Ya se lee como un animal de cuatro patas.", voxels: sheepBlock },
      { label: "Lana", note: "El cuerpo se redondea y gana bultos de 1 vóxel; la lana de abajo es un tono más oscura y unos pocos vóxels oscuros salpican el resto, como huecos entre rizos. La cabeza recibe un flequillo de lana y las patas, pezuñas oscuras.", voxels: sheepWool },
      { label: "Cara y detalle", note: "Orejas a los lados con el interior rosado, dos ojos blancos, un hocico más claro y una cola de lana detrás. Pocos vóxels, pero son los que dicen «oveja».", voxels: sheepFinal },
    ],
  },
  mazmorra: {
    description: "Mazmorra: una sala de piedra en corte, con atrezo y luz de antorchas",
    stages: [
      { label: "Sala", note: "Suelo de losas de 2×2 en dos tonos y dos paredes de sillares (fondo e izquierda), de 8 de alto, con las juntas alternas como un muro de verdad. El frente y la derecha, abiertos a la cámara.", voxels: dunRoom },
      { label: "Atrezo", note: "Un pilar de 2×2, un cofre pequeño (5×3×4) junto a la pared izquierda, dos soportes de antorcha en las paredes (aún apagados) y unas tablas rotas en el suelo.", voxels: dunProps },
      { label: "Historia y luz", note: "Llamas en las antorchas (para el material Emit), un charco, humedad y musgo en la base de las paredes y encima del pilar, y unos huesos con un cráneo en mitad de la sala, de camino a la salida: alguien no tuvo suerte.", voxels: dunStory },
    ],
  },
  escudo: {
    description: "Escudo redondo: forma, estructura y emblema",
    stages: [
      { label: "Forma", note: "Un disco de 13 de diámetro y 1 vóxel de grosor, hecho de tablas verticales de 2 en dos tonos de madera.", voxels: shieldForm },
      { label: "Estructura", note: "Una llanta de hierro de 1 vóxel alrededor, el umbo de metal en el centro (sobresale 2) y ocho remaches junto a la llanta, por dentro. El metal enmarca y protege: va donde el escudo recibe golpes.", voxels: shieldStruct },
      { label: "Emblema y uso", note: "Un galón (una V invertida) pintado en rojo con la punta en crema, una mella de 2 vóxels en la llanta (arriba a la derecha), un remache que falta (abajo a la derecha) y el asa por detrás. El emblema dice de quién es; la mella, que se ha usado.", voxels: shieldFinal },
    ],
  },
  ruina: {
    description: "Ruinas: un pórtico de piedra intacto, roto con intención y abandonado",
    stages: [
      { label: "Intacto", note: "Un pórtico sobre un suelo de losas: dos pilares con basa, fuste de 3×3 en hiladas de sillares y capitel, y un dintel que los une. Primero se construye entero: así sabes qué falta después.", voxels: ruinIntact },
      { label: "Roto", note: "Una grieta diagonal corta el pilar derecho; sin apoyo, el dintel se parte y cae. Los trozos que faltan están en el suelo, al pie de donde cayeron. El pilar izquierdo solo tiene algún desconchón.", voxels: ruinBroken },
      { label: "Abandonado", note: "El tiempo después de la rotura: hierba entre las losas, musgo encima del dintel y en la parte baja, una hiedra que baja por la cara de fuera del pilar y matas sueltas.", voxels: ruinOld },
    ],
  },
  vegetacion: {
    description: "Kit de vegetación: piezas pequeñas y cómo repartirlas",
    stages: [
      { label: "Piezas", note: "Ocho piezas en fila: tres arbustos de tamaños distintos (claro arriba, oscuro abajo), dos piedras con las esquinas de arriba gastadas y tres matas de hierba de 1–2 vóxels.", voxels: kitPieces },
      { label: "En rejilla", note: "Error: nueve piezas repartidas en una rejilla, a la misma distancia unas de otras. Se lee como un tablero, no como un prado: la naturaleza no reparte así.", voxels: vegGrid },
      { label: "En grupos", note: "Las piezas del kit, ahora en grupos: un arbusto grande con otros más pequeños pegados, una piedra al pie y hierba alrededor; un segundo grupo más pequeño, unas pocas matas sueltas y zonas vacías para que el ojo descanse.", voxels: vegClusters },
    ],
  },
  puente: {
    description: "Puente y escaleras: conectar dos orillas a distinta altura",
    stages: [
      { label: "Alturas", note: "Dos orillas a distinta altura: la izquierda con el suelo 3 vóxels más alto que la derecha, y un río de 8 de ancho en medio, con el agua 1 vóxel por debajo de la orilla baja. El problema: cómo pasa alguien de un lado al otro.", voxels: bridgeHeights },
      { label: "Escaleras y pila", note: "En la orilla baja, un rellano de piedra a la altura de la alta y dos peldaños de 1 de alto y 2 de fondo hasta el suelo. En mitad del río, una pila de piedra que sostendrá el tablero.", voxels: bridgeStairs },
      { label: "Tablero y barandilla", note: "Tablas cruzadas en dos tonos de la orilla al rellano, vigas debajo, postes y pasamanos a los lados. El camino de la orilla alta llega al puente y una farola marca la entrada.", voxels: bridgeFinal },
    ],
  },
  pocion: {
    description: "Poción de 8×8×8: un prop pequeño",
    stages: [
      { label: "Silueta", note: "El frasco en un solo color de cristal: un cuerpo redondo de 8 de ancho, un cuello de 2×2 y el borde de la boca un poco más ancho. A esta escala, la silueta es casi todo.", voxels: potSilhouette },
      { label: "Líquido y corcho", note: "El líquido ocupa la mitad de abajo del cuerpo (más oscuro en el fondo, más claro en la superficie) y el cristal queda arriba. Un corcho en la boca y un cordel oscuro en el cuello.", voxels: potLiquid },
      { label: "Detalle", note: "Una etiqueta crema de 4×2 delante con una marca de 1 vóxel, una burbuja en el líquido y un vóxel blanco de brillo arriba a la izquierda. Tres detalles de un vóxel: más, y el frasco se vuelve ruido.", voxels: potDetail },
    ],
  },
  "cofre-viejo": {
    description: "Cofre viejo: el mismo prop limpio, gastado y con historia",
    stages: [
      { label: "Limpio", note: "Un cofre de 12×8 de planta y 8 de alto, recién hecho: base con su borde oscuro, tapa escalonada, dos bandas de hierro y la cerradura dorada. Todo perfecto: parece de plástico.", voxels: chestClean },
      { label: "Desgaste", note: "Faltan trozos en algunas aristas (desconchones), la madera se aclara en los bordes, donde más se toca, y el hierro se oxida a manchas. El desgaste va donde hay uso: bordes y esquinas, no en mitad de las caras.", voxels: chestWorn },
      { label: "Historia", note: "Musgo que sube desde el suelo por un lado y se queda en un rincón de la tapa, barro en la base y tres monedas caídas en el suelo, junto al lado derecho. La cerradura sigue limpia: es lo que más se toca y el punto focal.", voxels: chestStory },
    ],
  },
  murcielago: {
    description: "Murciélago: un cuerpo pequeño y alas de un vóxel de grosor",
    stages: [
      { label: "Cuerpo", note: "Un óvalo para el cuerpo y otro más pequeño para la cabeza, con dos orejas de 1 vóxel. Solo 5 vóxels de ancho: el cuerpo es pequeño para que mande el ala.", voxels: [...batBody, ...batEars] },
      { label: "Alas", note: "Cada ala es una lámina de 1 vóxel de grosor y 10 de largo, más alta en la muñeca y con el borde de abajo festoneado entre los dedos. Con Mirror en X basta con hacer una.", voxels: [...batBody, ...batEars, ...batWings(false)] },
      { label: "Huesos y cara", note: "El brazo y tres dedos en un violeta casi negro recorren la membrana: le dan estructura y leen como ala aunque esté lejos. Ojos amarillos, lo más claro del modelo, dos colmillos de un crema algo más oscuro que los ojos y las garras.", voxels: [...batBody, ...batEars, ...batWings(true), ...batFace] },
    ],
  },
  "arbol-organico": {
    description: "Árbol orgánico: tronco curvo, ramas y copa en grupos",
    stages: [
      { label: "Tronco curvo", note: "El tronco se desplaza como mucho un vóxel por capa, con un vóxel de escalón en cada desplazamiento para que siga unido por caras. 2×2 abajo, 1×1 arriba y raíces en la base. Nada es recto, pero nada salta.", voxels: orgTrunk },
      { label: "Ramas", note: "Tres ramas en diagonal, a alturas distintas y hacia lados distintos, construidas vóxel a vóxel (de lado y luego arriba) para que no queden unidas solo por aristas. La asimetría es lo que lo hace orgánico.", voxels: [...orgTrunk, ...orgBranches] },
      { label: "Copa en grupos", note: "Cuatro masas de hojas de tamaños distintos al final de cada rama, con tres verdes: claro arriba, oscuro abajo. Grupos, no una bola.", voxels: [...orgTrunk, ...orgBranches, ...orgCanopy] },
    ],
  },
  habitacion: {
    description: "Habitación en corte: suelo, dos paredes y muebles",
    stages: [
      { label: "Caja", note: "Suelo de 14×14 con tablas en dos tonos y dos paredes (fondo e izquierda) de 10 de alto con rodapié. El frente y la derecha quedan abiertos: es un corte, como una casa de muñecas.", voxels: roomBox },
      { label: "Muebles", note: "Cama en el rincón del fondo, mesa y silla delante. Todo a la escala de una puerta de 4 vóxels: la mesa a 4 de alto, el asiento a 3.", voxels: roomFurniture },
      { label: "Detalle y luz", note: "Alfombra con borde, ventana con cruceta, un estante con tres libros y una vela en la mesa (llama en Emit). Los detalles dicen quién vive aquí.", voxels: roomDetail },
    ],
  },
  "slime-salto": {
    description: "Salto del slime en vóxels: cuatro etapas para renderizar como frames",
    stages: slimeJump,
  },
  terreno: {
    description: "Terreno: terrazas, estratos y un río",
    stages: [
      { label: "Terrazas", note: "Un mapa de alturas de 24×24 redondeado a escalones de 2 vóxels: dos colinas al fondo y una llanura delante. Un solo color: solo forma.", voxels: terrain(1) },
      { label: "Estratos", note: "El color depende de la altura: hierba arriba de cada columna, dos de tierra debajo y piedra en bandas alternas. Los cortes de las terrazas enseñan los estratos.", voxels: terrain(2) },
      { label: "Agua y vida", note: "Un río cruza la llanura de delante, un vóxel más bajo que la hierba, con una corriente más clara en el centro. Árboles pequeños y piedras sobre las terrazas: escala.", voxels: terrainLife },
    ],
  },
  carro: {
    description: "Carro: hard surface en vóxels",
    stages: [
      { label: "Blockout", note: "Una caja, cuatro ruedas de un vóxel de grosor y la lanza. Proporción y silueta, como el blockout de Blender.", voxels: cartBlock },
      { label: "Paneles", note: "La caja se vacía (paredes de 1 vóxel), el borde superior más claro y montantes oscuros cada 4 vóxels. Ruedas con llanta de hierro, radios y buje; eje de metal.", voxels: cartPanels },
      { label: "Herrajes", note: "Escuadras de hierro en las esquinas, remaches en los lados, un chaflán de 1 vóxel en las esquinas del borde y dos cajas de carga. El detalle mecánico va en bordes y uniones.", voxels: cartFinal },
    ],
  },
  diorama: {
    description: "Diorama: una base con estratos, una escena y detalles que cuentan algo",
    stages: [
      { label: "Base", note: "Un bloque de 22×22×4: piedra abajo, dos capas de tierra y la hierba arriba. El corte lateral, a la vista, ya dice «trozo de mundo».", voxels: dioramaBase },
      { label: "Escena", note: "La casa modular y un árbol de 8³ (el mismo de V1) sobre la base, un camino hasta la puerta y un estanque hundido un vóxel. Escala común: todo se mide con la casa.", voxels: dioramaScene },
      { label: "Detalle", note: "Una farola (llama en Emit), flores, una piedra, leña junto a la casa, hierba en dos tonos y el reflejo del cielo en el agua. Ningún detalle es nuevo: todos dicen que aquí vive alguien.", voxels: dioramaDetail },
    ],
  },
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
