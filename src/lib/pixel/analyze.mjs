// Análisis de sprites (JavaScript puro): lo usa el inspector y lo podrán usar las Forge Tools.
//
// - Píxel HUÉRFANO: no toca ningún píxel de su color, ni por los lados ni en diagonal.
//   A veces es intencionado (un brillo), pero casi siempre es un error.
// - Píxel SUELTO: no toca ningún píxel de su color por los lados (sí, quizá, en diagonal).
//   En una línea diagonal es normal; en un relleno indica ruido o dithering.
// - CLUSTER: un grupo de píxeles del mismo color conectados por los lados. Los clusters
//   pequeños y numerosos hacen que el sprite se vea «sucio».
import { TRANSPARENT } from "./sprite.mjs";

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8 = [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]];

export function analyzeSprite(s) {
  const h = s.rows.length, w = s.rows[0].length;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? TRANSPARENT : s.rows[y][x]);
  const orphans = [];
  const loose = [];
  const seen = new Set();
  const clusters = [];
  let opaque = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const ch = at(x, y);
      if (ch === TRANSPARENT) continue;
      opaque++;
      if (!N8.some(([dx, dy]) => at(x + dx, y + dy) === ch)) orphans.push({ x, y, ch });
      else if (!N4.some(([dx, dy]) => at(x + dx, y + dy) === ch)) loose.push({ x, y, ch });
      if (seen.has(`${x},${y}`)) continue;
      // relleno por inundación para medir el cluster
      const stack = [[x, y]];
      let size = 0;
      seen.add(`${x},${y}`);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        size++;
        for (const [dx, dy] of N4) {
          const nx = cx + dx, ny = cy + dy, k = `${nx},${ny}`;
          if (!seen.has(k) && at(nx, ny) === ch) { seen.add(k); stack.push([nx, ny]); }
        }
      }
      clusters.push({ ch, size });
    }
  const colors = new Set(s.rows.join("").replace(/\./g, "")).size;
  return {
    width: w, height: h, opaque, colors, orphans, loose,
    clusters: clusters.length,
    tinyClusters: clusters.filter((c) => c.size <= 2).length,
  };
}

/** Convierte una imagen (RGBA) en un sprite de datos. Devuelve null si tiene demasiados colores. */
const KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*+-/:;<=>?@^_~";
export function rgbaToSprite(width, height, data) {
  const palette = {}, byColor = new Map(), rows = [];
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) { row += TRANSPARENT; continue; }
      const hex = "#" + [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
      let k = byColor.get(hex);
      if (!k) {
        if (byColor.size >= KEYS.length) return null;
        k = KEYS[byColor.size];
        byColor.set(hex, k);
        palette[k] = hex;
      }
      row += k;
    }
    rows.push(row);
  }
  return { palette, rows };
}

/** Luminancia percibida (0–255, Rec. 709). */
export function luma(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}
