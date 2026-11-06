// Formato .vox de MagicaVoxel: escritor y lector mínimos (JavaScript puro, sin dependencias).
// Lo usan el script tools/build-vox.mjs (escribe) y el visor 3D de la web (lee).
//
// Estructura (todo little-endian):
//   "VOX " + versión 150
//   chunk MAIN { SIZE, XYZI, RGBA }
//   cada chunk: id (4 letras) · tamaño del contenido · tamaño de los hijos · contenido · hijos
//   SIZE: x, y, z (el eje Z es la ALTURA en MagicaVoxel)
//   XYZI: número de vóxeles + (x, y, z, índiceColor) en 1 byte cada uno; índices 1–255
//   RGBA: 256 colores; el índice i de XYZI usa la entrada i-1 de la paleta

/** @typedef {{ x:number, y:number, z:number, c:string }} Voxel  — c = color #rrggbb */

/** Convierte una lista de vóxeles con color en un .vox (Uint8Array). Máx. 255 colores, 256³. */
export function writeVox(voxels) {
  if (!voxels.length) throw new Error("Un modelo .vox necesita al menos un vóxel");
  const minX = Math.min(...voxels.map((v) => v.x)), minY = Math.min(...voxels.map((v) => v.y)), minZ = Math.min(...voxels.map((v) => v.z));
  const norm = voxels.map((v) => ({ ...v, x: v.x - minX, y: v.y - minY, z: v.z - minZ }));
  const sx = Math.max(...norm.map((v) => v.x)) + 1, sy = Math.max(...norm.map((v) => v.y)) + 1, sz = Math.max(...norm.map((v) => v.z)) + 1;
  if (sx > 256 || sy > 256 || sz > 256) throw new Error("El modelo supera 256³");
  const colors = [...new Set(norm.map((v) => v.c.toLowerCase()))];
  if (colors.length > 255) throw new Error("Un .vox admite como máximo 255 colores");
  const index = new Map(colors.map((c, i) => [c, i + 1]));
  // quitar duplicados (mismo x,y,z): gana el último
  const unique = [...new Map(norm.map((v) => [`${v.x},${v.y},${v.z}`, v])).values()];

  const chunk = (id, content, children = new Uint8Array(0)) => {
    const out = new Uint8Array(12 + content.length + children.length);
    const dv = new DataView(out.buffer);
    for (let i = 0; i < 4; i++) out[i] = id.charCodeAt(i);
    dv.setUint32(4, content.length, true);
    dv.setUint32(8, children.length, true);
    out.set(content, 12);
    out.set(children, 12 + content.length);
    return out;
  };
  const size = new Uint8Array(12);
  new DataView(size.buffer).setUint32(0, sx, true);
  new DataView(size.buffer).setUint32(4, sy, true);
  new DataView(size.buffer).setUint32(8, sz, true);
  const xyzi = new Uint8Array(4 + unique.length * 4);
  new DataView(xyzi.buffer).setUint32(0, unique.length, true);
  unique.forEach((v, i) => xyzi.set([v.x, v.y, v.z, index.get(v.c.toLowerCase())], 4 + i * 4));
  const rgba = new Uint8Array(256 * 4);
  colors.forEach((c, i) => {
    const n = parseInt(c.slice(1), 16);
    rgba.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], i * 4);
  });
  const children = [chunk("SIZE", size), chunk("XYZI", xyzi), chunk("RGBA", rgba)];
  const all = new Uint8Array(children.reduce((a, c) => a + c.length, 0));
  let p = 0;
  for (const c of children) { all.set(c, p); p += c.length; }
  const main = chunk("MAIN", new Uint8Array(0), all);
  const file = new Uint8Array(8 + main.length);
  file.set([0x56, 0x4f, 0x58, 0x20], 0); // "VOX "
  new DataView(file.buffer).setUint32(4, 150, true);
  file.set(main, 8);
  return file;
}

/** Lee el primer modelo de un .vox. Devuelve tamaño, vóxeles (con color) y paleta usada. */
export function readVox(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const tag = (p) => String.fromCharCode(u8[p], u8[p + 1], u8[p + 2], u8[p + 3]);
  if (tag(0) !== "VOX ") throw new Error("No es un archivo .vox");
  let size = null, raw = null, palette = null;
  // recorremos los chunks hijos de MAIN de forma lineal
  let p = 8 + 12; // saltamos la cabecera y la cabecera de MAIN
  while (p + 12 <= u8.length) {
    const id = tag(p), n = dv.getUint32(p + 4, true), m = dv.getUint32(p + 8, true);
    const c = p + 12;
    if (id === "SIZE" && !size) size = { x: dv.getUint32(c, true), y: dv.getUint32(c + 4, true), z: dv.getUint32(c + 8, true) };
    else if (id === "XYZI" && !raw) {
      const count = dv.getUint32(c, true);
      raw = [];
      for (let i = 0; i < count; i++) raw.push([u8[c + 4 + i * 4], u8[c + 5 + i * 4], u8[c + 6 + i * 4], u8[c + 7 + i * 4]]);
    } else if (id === "RGBA") {
      palette = [];
      for (let i = 0; i < 256; i++) palette.push([u8[c + i * 4], u8[c + i * 4 + 1], u8[c + i * 4 + 2]]);
    }
    p = c + n + m;
  }
  if (!size || !raw) throw new Error("El .vox no contiene ningún modelo");
  const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
  // si no trae paleta, MagicaVoxel usa la suya por defecto: usamos un gris neutro
  const colorOf = (i) => (palette ? hex(palette[i - 1]) : "#9aa3b5");
  const voxels = raw.map(([x, y, z, i]) => ({ x, y, z, c: colorOf(i) }));
  return { size, voxels, colors: [...new Set(voxels.map((v) => v.c))] };
}
