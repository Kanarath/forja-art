// Formato y validación de sprites como DATOS.
// Es JavaScript puro (.mjs) a propósito: lo usan tanto la web (Astro) como el script
// tools/build-sprites.mjs que genera los PNG. Una sola definición de «sprite válido».
//
// Formato de art-src/sprites/<nombre>.sprite.json:
// {
//   "name": "gem",                      ← debe coincidir con el nombre del archivo
//   "description": "Gema 9×7…",
//   "license": "CC0 · FORJA//ART",
//   "tags": ["prop", "gema"],
//   "palette": { "1": "#1b1030", … },   ← un carácter → un color #rrggbb (o #rrggbbaa)
//   "rows": ["..11111..", …]            ← "." es transparente; todas las filas, mismo ancho
// }

export const TRANSPARENT = ".";

/** Devuelve una lista de errores legibles (vacía si el sprite es válido). */
export function validateSprite(s, file = "sprite") {
  const e = [];
  const at = (msg) => e.push(`${file}: ${msg}`);
  if (!s || typeof s !== "object") return [`${file}: no es un objeto JSON`];
  if (typeof s.name !== "string" || !/^[a-z0-9-]+$/.test(s.name)) at("«name» debe ser minúsculas, números o guiones");
  if (typeof s.description !== "string" || s.description.length < 5) at("falta «description»");
  if (typeof s.license !== "string") at("falta «license» (de dónde sale y bajo qué licencia)");
  if (!s.palette || typeof s.palette !== "object") at("falta «palette»");
  if (!Array.isArray(s.rows) || s.rows.length === 0) at("faltan «rows»");
  if (e.length) return e;

  for (const [k, c] of Object.entries(s.palette)) {
    if (k.length !== 1 || k === TRANSPARENT) at(`clave de paleta «${k}» no válida (un solo carácter, distinto de «.»)`);
    if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(c)) at(`color «${c}» de «${k}» no es #rrggbb`);
  }
  const width = s.rows[0].length;
  s.rows.forEach((row, y) => {
    if (row.length !== width) at(`la fila ${y} mide ${row.length} y la primera ${width}: todas deben medir lo mismo`);
    [...row].forEach((ch, x) => {
      if (ch !== TRANSPARENT && !(ch in s.palette)) at(`carácter «${ch}» en (${x},${y}) no está en la paleta`);
    });
  });
  const used = new Set(s.rows.join(""));
  for (const k of Object.keys(s.palette)) if (!used.has(k)) at(`el color «${k}» de la paleta no se usa`);
  return e;
}

/** Convierte un sprite en una matriz RGBA (Uint8Array, 4 bytes por píxel). */
export function spriteToRGBA(s) {
  const w = s.rows[0].length, h = s.rows.length;
  const out = new Uint8Array(w * h * 4);
  s.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === TRANSPARENT) return;
      const hex = s.palette[ch].slice(1);
      const i = (y * w + x) * 4;
      out[i] = parseInt(hex.slice(0, 2), 16);
      out[i + 1] = parseInt(hex.slice(2, 4), 16);
      out[i + 2] = parseInt(hex.slice(4, 6), 16);
      out[i + 3] = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255;
    }),
  );
  return { width: w, height: h, data: out };
}
