// Contraste de los colores del diseño (WCAG 2.x). Ejecuta: npm test
// Lee los tokens de src/styles/tokens.css: si alguien cambia un color y deja de leerse, falla.
// Texto normal ≥ 4,5:1 · texto grande o elementos de interfaz ≥ 3:1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/tokens.css", "utf8");
const token = (name: string) => {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`Token --${name} no encontrado`);
  return m[1];
};
const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const L = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const ratio = (a: string, b: string) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const pairs: [string, string, number, string][] = [
  ["text", "bg", 4.5, "texto principal sobre el fondo"],
  ["text", "panel", 4.5, "texto principal sobre paneles"],
  ["muted", "bg", 4.5, "texto secundario sobre el fondo"],
  ["muted", "panel", 4.5, "texto secundario sobre paneles"],
  ["muted", "panel-2", 4.5, "texto secundario sobre paneles 2"],
  ["pixel", "bg", 4.5, "acento pixel como texto"],
  ["voxel", "bg", 4.5, "acento voxel como texto"],
  ["fund", "bg", 4.5, "acento fundamentos como texto"],
  ["pixel", "panel", 4.5, "acento pixel en paneles"],
  ["bg", "pixel", 4.5, "texto oscuro sobre botón pixel"],
  ["bg", "voxel", 4.5, "texto oscuro sobre botón voxel"],
  ["bg", "fund", 4.5, "texto oscuro sobre botón fundamentos"],
  ["line", "bg", 1.3, "bordes sutiles (decorativos)"],
];

for (const [fg, bg, min, what] of pairs)
  test(`contraste: ${what} (--${fg} / --${bg}) ≥ ${min}`, () => {
    const r = ratio(token(fg), token(bg));
    assert.ok(r >= min, `${r.toFixed(2)}:1 (mínimo ${min}:1)`);
  });
