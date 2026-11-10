#!/usr/bin/env node
// FORJA//ART · Forge Tools · forja-vox
// Herramienta de línea de comandos para archivos .vox de MagicaVoxel. Un solo archivo, sin dependencias:
// solo necesita Node 18 o superior. Licencia MIT.
//
//   node forja-vox.mjs info    modelo.vox
//   node forja-vox.mjs check   modelo.vox
//   node forja-vox.mjs palette modelo.vox [-o paleta.gpl|paleta.png|paleta.txt]
//   node forja-vox.mjs recolor entrada.vox salida.vox --map "#aabbcc:#112233,#ddeeff:#445566"
//   node forja-vox.mjs render  a.vox [b.vox …] -o hoja.png [--size 4] [--angles 1|4] [--outline] [--gap 0]
//
// `render` dibuja cada .vox en isométrico (proporción 2:1, la del pixel art) con tres tonos por cubo
// (arriba claro, izquierda medio, derecha oscuro) y los pone en fila en una sola hoja: todos los
// cuadros miden lo mismo y comparten el suelo, así que sirven como frames de una animación.
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { basename, extname } from "node:path";
import { pathToFileURL } from "node:url";

// ------------------------------------------------------------------ .vox: lectura y escritura
/** Lee un .vox. Devuelve todos los modelos (SIZE + XYZI), la paleta de 256 colores y la lista de chunks. */
export function parseVox(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const tag = (p) => String.fromCharCode(u8[p], u8[p + 1], u8[p + 2], u8[p + 3]);
  if (u8.length < 20 || tag(0) !== "VOX ") throw new Error("No es un archivo .vox (falta la firma «VOX »)");
  const version = dv.getUint32(4, true);
  if (tag(8) !== "MAIN") throw new Error("El .vox no tiene chunk MAIN");
  const models = [], chunks = [];
  let palette = null, size = null;
  let p = 20;
  while (p + 12 <= u8.length) {
    const id = tag(p), n = dv.getUint32(p + 4, true), m = dv.getUint32(p + 8, true), c = p + 12;
    if (c + n > u8.length) throw new Error(`El chunk ${id} se sale del archivo: el .vox está cortado`);
    chunks.push(id);
    if (id === "SIZE") size = { x: dv.getUint32(c, true), y: dv.getUint32(c + 4, true), z: dv.getUint32(c + 8, true) };
    else if (id === "XYZI") {
      const count = dv.getUint32(c, true), voxels = [];
      for (let i = 0; i < count; i++) { const q = c + 4 + i * 4; voxels.push({ x: u8[q], y: u8[q + 1], z: u8[q + 2], i: u8[q + 3] }); }
      models.push({ size: size ?? { x: 0, y: 0, z: 0 }, voxels });
      size = null;
    } else if (id === "RGBA") {
      palette = [];
      for (let i = 0; i < 256; i++) palette.push([u8[c + i * 4], u8[c + i * 4 + 1], u8[c + i * 4 + 2], u8[c + i * 4 + 3]]);
    }
    p = c + n + m;
  }
  if (!models.length) throw new Error("El .vox no contiene ningún modelo");
  return { version, models, palette: palette ?? defaultPalette(), hasPalette: !!palette, chunks };
}

// Sin chunk RGBA, MagicaVoxel usa su paleta por defecto. Aquí se aproxima con grises (suficiente para medir).
function defaultPalette() { return Array.from({ length: 256 }, (_, i) => [128 + (i % 64), 128 + (i % 64), 128 + (i % 64), 255]); }

const hex = (rgb) => "#" + rgb.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("");
/** Color (#rrggbb) del índice i de un vóxel: el índice i usa la entrada i-1 de la paleta. */
export const colorOf = (vox, i) => hex(vox.palette[(i - 1 + 256) % 256]);

/** Escribe un modelo como .vox (SIZE, XYZI y RGBA). */
export function writeVoxModel(size, voxels, palette) {
  const chunk = (id, content, children = new Uint8Array(0)) => {
    const out = new Uint8Array(12 + content.length + children.length), dv = new DataView(out.buffer);
    for (let k = 0; k < 4; k++) out[k] = id.charCodeAt(k);
    dv.setUint32(4, content.length, true); dv.setUint32(8, children.length, true);
    out.set(content, 12); out.set(children, 12 + content.length);
    return out;
  };
  const s = new Uint8Array(12), sd = new DataView(s.buffer);
  sd.setUint32(0, size.x, true); sd.setUint32(4, size.y, true); sd.setUint32(8, size.z, true);
  const xyzi = new Uint8Array(4 + voxels.length * 4);
  new DataView(xyzi.buffer).setUint32(0, voxels.length, true);
  voxels.forEach((v, k) => xyzi.set([v.x, v.y, v.z, v.i], 4 + k * 4));
  const rgba = new Uint8Array(1024);
  palette.forEach((c, k) => rgba.set([c[0], c[1], c[2], c[3] ?? 255], k * 4));
  const kids = [chunk("SIZE", s), chunk("XYZI", xyzi), chunk("RGBA", rgba)];
  const all = new Uint8Array(kids.reduce((a, c) => a + c.length, 0));
  let q = 0; for (const c of kids) { all.set(c, q); q += c.length; }
  const main = chunk("MAIN", new Uint8Array(0), all);
  const file = new Uint8Array(8 + main.length);
  file.set([0x56, 0x4f, 0x58, 0x20]); new DataView(file.buffer).setUint32(4, 150, true); file.set(main, 8);
  return file;
}

// ------------------------------------------------------------------ PNG
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
/** Codifica una imagen RGBA como PNG. */
export function encodePNG(width, height, rgba) {
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0); out.write(type, 4, "ascii"); Buffer.from(data).copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// ------------------------------------------------------------------ comandos
/** Datos básicos del primer modelo. */
export function info(vox) {
  const m = vox.models[0];
  const used = [...new Set(m.voxels.map((v) => v.i))].sort((a, b) => a - b);
  return {
    version: vox.version, modelos: vox.models.length, tamaño: m.size, vóxeles: m.voxels.length,
    colores: used.length, índices: used, paletaPropia: vox.hasPalette,
    colorHex: used.map((i) => colorOf(vox, i)),
  };
}

/** Comprueba errores (impiden usar el archivo) y avisos (suelen ser fallos de modelado). */
export function check(vox) {
  const errors = [], warnings = [];
  vox.models.forEach((m, k) => {
    const tag = vox.models.length > 1 ? `modelo ${k + 1}: ` : "";
    const { x: sx, y: sy, z: sz } = m.size;
    if (sx > 256 || sy > 256 || sz > 256) errors.push(`${tag}el tamaño ${sx}×${sy}×${sz} supera 256 en algún eje`);
    const seen = new Map();
    for (const v of m.voxels) {
      if (v.x >= sx || v.y >= sy || v.z >= sz) errors.push(`${tag}vóxel fuera del tamaño declarado en (${v.x},${v.y},${v.z})`);
      if (v.i === 0) errors.push(`${tag}vóxel con índice de color 0 en (${v.x},${v.y},${v.z}): MagicaVoxel lo trata como vacío`);
      const key = `${v.x},${v.y},${v.z}`;
      if (seen.has(key)) errors.push(`${tag}vóxel repetido en (${key})`);
      seen.set(key, v);
    }
    // vóxeles flotantes: por encima del suelo y sin tocar nada, ni por las caras ni por las esquinas
    // (por las esquinas cuenta: muchos modelos se guardan vaciados por dentro y un vóxel de encima solo toca en diagonal)
    const N = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const N26 = [];
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) if (a || b || c) N26.push([a, b, c]);
    const floating = m.voxels.filter((v) => v.z > 0 && !N26.some(([a, b, c]) => seen.has(`${v.x + a},${v.y + b},${v.z + c}`)));
    if (floating.length) warnings.push(`${tag}${floating.length} vóxel(es) flotando sin tocar nada: ${floating.slice(0, 5).map((v) => `(${v.x},${v.y},${v.z})`).join(" ")}${floating.length > 5 ? " …" : ""}`);
    // piezas sueltas: grupos que no se tocan ni por las esquinas (igual que los flotantes: los modelos vaciados por dentro solo se tocan en diagonal)
    const left = new Set(seen.keys());
    let parts = 0;
    while (left.size) {
      parts++;
      const start = left.values().next().value, stack = [start];
      left.delete(start);
      while (stack.length) {
        const [x, y, z] = stack.pop().split(",").map(Number);
        for (const [a, b, c] of N26) { const q = `${x + a},${y + b},${z + c}`; if (left.has(q)) { left.delete(q); stack.push(q); } }
      }
    }
    if (parts > 1) warnings.push(`${tag}el modelo está partido en ${parts} piezas que no se tocan (puede ser a propósito: cascotes, monedas…)`);
    const colors = new Set(m.voxels.map((v) => v.i)).size;
    if (colors > 32) warnings.push(`${tag}usa ${colors} colores: en vóxels, una paleta corta (8–24) suele leerse mejor`);
  });
  return { errors, warnings, ok: errors.length === 0 };
}

/** Paleta usada como texto, .gpl (GIMP/Aseprite) o PNG de muestras. */
export function paletteOut(vox, format) {
  const used = info(vox).índices;
  const cols = used.map((i) => vox.palette[i - 1]);
  if (format === "gpl") return Buffer.from(["GIMP Palette", "Name: forja-vox", "Columns: 8", "#", ...cols.map((c, k) => `${String(c[0]).padStart(3)} ${String(c[1]).padStart(3)} ${String(c[2]).padStart(3)}\tíndice ${used[k]}`)].join("\n") + "\n");
  if (format === "png") {
    const S = 8, w = cols.length * S, data = new Uint8Array(w * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < w; x++) data.set([...cols[Math.floor(x / S)].slice(0, 3), 255], (y * w + x) * 4);
    return encodePNG(w, S, data);
  }
  return Buffer.from(used.map((i, k) => `${String(i).padStart(3)}  ${hex(cols[k])}`).join("\n") + "\n");
}

/** Cambia colores de la paleta: map es una lista de pares [#viejo, #nuevo]. Devuelve el .vox nuevo y cuántos cambió. */
export function recolor(vox, map) {
  const pal = vox.palette.map((c) => c.slice());
  let changed = 0;
  for (const [from, to] of map) {
    const f = from.toLowerCase(), n = parseInt(to.slice(1), 16);
    pal.forEach((c, k) => { if (hex(c) === f) { pal[k] = [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]; changed++; } });
  }
  const m = vox.models[0];
  return { bytes: writeVoxModel(m.size, m.voxels, pal), changed };
}

/** Plantilla de un cubo isométrico de lado u: cada píxel dice qué cara es (1 arriba, 2 izquierda, 3 derecha). */
function cubeStamp(u) {
  const w = 2 * u, h = 2 * u, face = new Uint8Array(w * h);
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const x = px + 0.5 - u, y = py + 0.5; // x relativo al eje vertical del cubo
    // silueta: un hexágono de vértices (0,0) (±u,u/2) (±u,1.5u) (0,2u); la cara de arriba es el rombo superior
    const ax = Math.abs(x);
    const inside = ax <= u && y >= ax / 2 && y <= 2 * u - ax / 2;
    const top = ax / u + Math.abs(y - u / 2) / (u / 2) <= 1;
    face[py * w + px] = !inside ? 0 : top ? 1 : x < 0 ? 2 : 3;
  }
  return { w, h, face };
}

/** Rota los vóxeles k cuartos de vuelta alrededor del eje vertical (Z). La vista 0 enseña el frente (-Y), como la cámara por defecto de MagicaVoxel. */
function rotate(voxels, size, k) {
  let v = voxels, sx = size.x, sy = size.y;
  for (let r = 0; r < k; r++) { v = v.map((q) => ({ ...q, x: sy - 1 - q.y, y: q.x })); [sx, sy] = [sy, sx]; }
  return { voxels: v, size: { x: sx, y: sy, z: size.z } };
}

/**
 * Dibuja uno o varios modelos en isométrico y los pone en fila.
 * opts: size (lado del cubo en píxeles, par: 2, 4, 6…), angles (1 o 4 vistas por modelo), outline, gap.
 */
export function render(voxes, { size = 4, angles = 1, outline = false, gap = 0 } = {}) {
  if (!Number.isInteger(size) || size < 2 || size % 2) throw new Error(`--size debe ser un número par de 2 en adelante (2, 4, 6…); has puesto «${size}»`);
  if (angles !== 1 && angles !== 4) throw new Error(`--angles solo admite 1 o 4; has puesto «${angles}»`);
  if (!Number.isInteger(gap) || gap < 0) throw new Error(`--gap debe ser un número entero de 0 en adelante; has puesto «${gap}»`);
  const u = size;
  const stamp = cubeStamp(u);
  const shade = [0, 1, 0.78, 0.6]; // arriba, izquierda, derecha: la luz llega de arriba a la izquierda
  const views = [];
  for (const vox of voxes) for (let a = 0; a < angles; a++) views.push({ vox, ...rotate(vox.models[0].voxels, vox.models[0].size, (a + 2) % 4) }); // +2: se ven las caras -X y -Y (el frente)
  // misma caja para todos los cuadros: así comparten suelo y escala
  const proj = (v) => ({ sx: (v.x - v.y) * u, sy: (v.x + v.y) * (u / 2) - v.z * u });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const { voxels } of views) for (const v of voxels) {
    const { sx, sy } = proj(v);
    minX = Math.min(minX, sx - u); maxX = Math.max(maxX, sx + u); minY = Math.min(minY, sy); maxY = Math.max(maxY, sy + 2 * u);
  }
  const pad = outline ? 1 : 0;
  const fw = maxX - minX + 2 * pad, fh = maxY - minY + 2 * pad;
  const W = views.length * fw + (views.length - 1) * gap, H = fh;
  const data = new Uint8Array(W * H * 4);
  views.forEach(({ vox, voxels }, k) => {
    const ox = k * (fw + gap) + pad - minX, oy = pad - minY;
    // orden del pintor: de lejos a cerca según x+y+z (lo que está delante O encima se pinta después)
    const order = voxels.slice().sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z) || a.z - b.z);
    for (const v of order) {
      const rgb = vox.palette[(v.i - 1 + 256) % 256];
      const { sx, sy } = proj(v);
      for (let py = 0; py < stamp.h; py++) for (let px = 0; px < stamp.w; px++) {
        const f = stamp.face[py * stamp.w + px];
        if (!f) continue;
        const X = ox + sx - u + px, Y = oy + sy + py;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        data.set([...rgb.slice(0, 3).map((c) => Math.round(c * shade[f])), 255], (Y * W + X) * 4);
      }
    }
    if (outline) {
      const x0 = k * (fw + gap), solid = (x, y) => x >= x0 && x < x0 + fw && y >= 0 && y < H && data[(y * W + x) * 4 + 3] === 255;
      const mark = new Set();
      for (let y = 0; y < H; y++) for (let x = x0; x < x0 + fw; x++) if (!solid(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => solid(x + a, y + b))) mark.add(y * W + x);
      for (const q of mark) data.set([27, 16, 48, 255], q * 4);
    }
  });
  return { width: W, height: H, frameWidth: fw, frames: views.length, png: encodePNG(W, H, data) };
}

// ------------------------------------------------------------------ CLI
const HELP = `forja-vox · Forge Tools de FORJA//ART

  info    <modelo.vox>                 tamaño, vóxeles y colores
  check   <modelo.vox>                 errores y avisos (vóxeles flotantes, piezas sueltas…)
  palette <modelo.vox> [-o archivo]    paleta usada: .gpl (Aseprite/GIMP), .png o texto
  recolor <entrada.vox> <salida.vox> --map "#viejo:#nuevo,…"
  render  <a.vox> [b.vox …] -o hoja.png [--size 4] [--angles 1|4] [--outline] [--gap 0]
          --size: lado del cubo en px (par). La hoja añade a cada color dos tonos de sombra (78 % y 60 %)
          y, con --outline, el contorno #1b1030: tiene más colores que los que saca «palette».

  Ejemplo: node forja-vox.mjs render salto_1.vox salto_2.vox salto_3.vox salto_4.vox -o salto.png --size 4`;

function arg(args, name, def) { const k = args.indexOf(name); return k >= 0 ? args[k + 1] : def; }
const load = (f) => parseVox(readFileSync(f));

export function main(argv) {
  const [cmd, ...args] = argv;
  const files = args.filter((a, k) => !a.startsWith("--") && !a.startsWith("-o") && !(k > 0 && ["-o", "--map", "--size", "--angles", "--gap"].includes(args[k - 1])));
  switch (cmd) {
    case "info": {
      const r = info(load(files[0]));
      console.log(`${basename(files[0])}: ${r.tamaño.x}×${r.tamaño.y}×${r.tamaño.z}, ${r.vóxeles} vóxeles, ${r.colores} colores${r.modelos > 1 ? `, ${r.modelos} modelos (se muestra el primero)` : ""}${r.paletaPropia ? "" : ", sin paleta propia"}`);
      r.índices.forEach((i, k) => console.log(`  ${String(i).padStart(3)}  ${r.colorHex[k]}`));
      return 0;
    }
    case "check": {
      const r = check(load(files[0]));
      r.errors.forEach((e) => console.log(`✖ ${e}`));
      r.warnings.forEach((w) => console.log(`⚠ ${w}`));
      if (r.ok && !r.warnings.length) console.log("✔ Sin errores ni avisos");
      else if (r.ok) console.log("✔ Sin errores (revisa los avisos)");
      return r.ok ? 0 : 1;
    }
    case "palette": {
      const out = arg(args, "-o");
      const fmt = out ? extname(out).slice(1).toLowerCase() : "txt";
      const buf = paletteOut(load(files[0]), fmt);
      if (out) { writeFileSync(out, buf); console.log(`✔ Paleta guardada en ${out}`); } else process.stdout.write(buf);
      return 0;
    }
    case "recolor": {
      const map = (arg(args, "--map", "") || "").split(",").filter(Boolean).map((p) => p.split(":").map((s) => s.trim()));
      if (!map.length || map.some((p) => p.length !== 2 || !/^#[0-9a-f]{6}$/i.test(p[0]) || !/^#[0-9a-f]{6}$/i.test(p[1]))) { console.error('Usa --map "#aabbcc:#112233,#…:#…"'); return 2; }
      const r = recolor(load(files[0]), map);
      writeFileSync(files[1], r.bytes);
      console.log(`✔ ${r.changed} color(es) cambiados → ${files[1]}`);
      return 0;
    }
    case "render": {
      const out = arg(args, "-o");
      if (!out || !files.length) { console.error("Indica los .vox y la salida: render a.vox -o hoja.png"); return 2; }
      const num = (name, def) => { const raw = arg(args, name, String(def)); const n = Number(raw); if (!Number.isFinite(n)) throw new Error(`${name} necesita un número; has puesto «${raw}»`); return n; };
      const gap = num("--gap", 0);
      const r = render(files.map(load), { size: num("--size", 4), angles: num("--angles", 1), outline: args.includes("--outline"), gap });
      writeFileSync(out, r.png);
      console.log(`✔ ${out}: ${r.frames} cuadro(s) de ${r.frameWidth}×${r.height} px en una fila (${r.width}×${r.height}).`);
      console.log(gap ? `  Con --gap ${gap} los cuadros no llenan la hoja a partes iguales: en Godot usa una región por cuadro o vuelve a renderizar con --gap 0.` : `  En Godot: hframes = ${r.frames}.`);
      return 0;
    }
    default:
      console.log(HELP);
      return cmd ? 2 : 0;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`✖ ${e.message}`); process.exitCode = 1; }
}
