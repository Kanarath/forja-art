// Dithering y sombreado (JavaScript puro): lo usan los labs de dithering y de luz.

// ---------- DITHERING
// El dithering mezcla dos colores con un PATRÓN para sugerir un tono intermedio que no está
// en la paleta. Matrices de Bayer: umbrales ordenados que reparten los píxeles de forma regular.
export const BAYER2 = [[0, 2], [3, 1]];
export const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

/** PRNG determinista (mulberry32): el «ruido» sale siempre igual para la misma semilla. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * ¿Este píxel usa el color B? `t` (0–1) es cuánto de B queremos en esa zona.
 * method: "none" (corte duro a la mitad) · "checker" (damero en la franja central) ·
 *         "bayer2" · "bayer4" · "noise"
 */
export function ditherPick(method, x, y, t, rand) {
  switch (method) {
    case "none": return t >= 0.5;
    case "checker": return t < 0.33 ? false : t > 0.66 ? true : (x + y) % 2 === 0;
    case "bayer2": return t > (BAYER2[y % 2][x % 2] + 0.5) / 4;
    case "bayer4": return t > (BAYER4[y % 4][x % 4] + 0.5) / 16;
    case "noise": return t > rand();
    default: throw new Error(`Método de dithering desconocido: ${method}`);
  }
}

/** Degradado horizontal de A a B, como filas de 'a'/'b' (formato de sprite). */
export function ditherGradient(method, w = 32, h = 8, seed = 7) {
  const rand = rng(seed);
  const rows = [];
  for (let y = 0; y < h; y++) {
    let r = "";
    for (let x = 0; x < w; x++) r += ditherPick(method, x, y, w === 1 ? 0 : x / (w - 1), rand) ? "b" : "a";
    rows.push(r);
  }
  return rows;
}

// ---------- SOMBREADO DE UNA ESFERA
/**
 * Sombrea una esfera de `size`×`size` píxeles con una luz que llega desde `angle` (grados,
 * 0 = derecha, 90 = arriba) y `elevation` (0 rasante, 90 cenital). Devuelve un índice de
 * tono por píxel (0 = más oscuro … tones-1 = más claro) o -1 fuera de la esfera.
 * También marca el contorno (-2) si `outline`.
 * `bounce` añade luz rebotada en el borde opuesto a la luz (un tono más claro que la sombra).
 */
export function shadeSphere({ size = 24, angle = 135, elevation = 45, tones = 4, outline = true, bounce = true }) {
  const a = (angle * Math.PI) / 180, e = (elevation * Math.PI) / 180;
  // dirección de la luz (x a la derecha, y hacia ARRIBA en pantalla, z hacia el espectador)
  const L = [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
  const r = size / 2 - 0.5, c = (size - 1) / 2;
  const grid = [];
  for (let py = 0; py < size; py++) {
    const row = [];
    for (let px = 0; px < size; px++) {
      const nx = (px - c) / r, ny = -(py - c) / r, d2 = nx * nx + ny * ny;
      if (d2 > 1) { row.push(-1); continue; }
      const nz = Math.sqrt(1 - d2);
      let lambert = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      // luz rebotada: en el borde en sombra, un tono por encima del más oscuro (nunca tan clara como la luz)
      if (bounce && tones >= 3 && lambert === 0 && d2 > 0.6) lambert = 1.01 / tones;
      row.push(Math.min(tones - 1, Math.floor(lambert * tones)));
    }
    grid.push(row);
  }
  if (outline) {
    // el contorno es el borde exterior de la esfera (píxeles dentro con algún vecino fuera)
    const inside = (x, y) => grid[y]?.[x] !== undefined && grid[y][x] >= 0;
    const out = grid.map((row, y) => row.map((v, x) => (v >= 0 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inside(x + dx, y + dy)) ? -2 : v)));
    return out;
  }
  return grid;
}
