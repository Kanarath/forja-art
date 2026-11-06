// Genera los PNG de los sprites a partir de art-src/sprites/*.sprite.json.
//   node tools/build-sprites.mjs
// Salida en public/assets/sprites/:  <nombre>.png (1×)  y  <nombre>@8x.png (ampliado vecino a vecino)
//
// Sin dependencias: un PNG es una firma + bloques (IHDR, IDAT, IEND). Los píxeles van
// comprimidos con zlib, que Node ya incluye. Cada bloque lleva un CRC32 para detectar errores.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { join } from "node:path";
import { validateSprite, spriteToRGBA } from "../src/lib/pixel/sprite.mjs";

const SRC = "art-src/sprites";
const OUT = "public/assets/sprites";
const SCALES = [1, 8];

// --- CRC32 (el que exige el formato PNG)
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** Codifica RGBA (8 bits por canal) como PNG. */
function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // tipo de color 6 = RGBA
  // cada fila empieza con un byte de «filtro» (0 = ninguno)
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

/** Amplía vecino a vecino: cada píxel se convierte en un bloque de s×s. Nunca suaviza. */
function scaleNearest({ width, height, data }, s) {
  const out = new Uint8Array(width * s * height * s * 4);
  for (let y = 0; y < height * s; y++)
    for (let x = 0; x < width * s; x++) {
      const src = (Math.floor(y / s) * width + Math.floor(x / s)) * 4;
      out.set(data.subarray(src, src + 4), (y * width * s + x) * 4);
    }
  return { width: width * s, height: height * s, data: out };
}

const files = readdirSync(SRC).filter((f) => f.endsWith(".sprite.json"));
const errors = [];
const sprites = files.map((f) => {
  const s = JSON.parse(readFileSync(join(SRC, f), "utf8"));
  errors.push(...validateSprite(s, join(SRC, f)));
  return s;
});
if (errors.length) {
  console.error(`\nSprites no válidos:\n  - ${errors.join("\n  - ")}\n`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true }); // los PNG son derivados: se regeneran siempre
mkdirSync(OUT, { recursive: true });
for (const s of sprites) {
  const img = spriteToRGBA(s);
  for (const k of SCALES) {
    const im = k === 1 ? img : scaleNearest(img, k);
    writeFileSync(join(OUT, k === 1 ? `${s.name}.png` : `${s.name}@${k}x.png`), encodePNG(im.width, im.height, im.data));
  }
}
console.log(`Sprites: ${sprites.length} válidos → ${sprites.length * SCALES.length} PNG en ${OUT}/`);
