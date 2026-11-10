// Tests de la CLI forja-vox (Forge Tools). Usan modelos creados aquí con el escritor de la academia.
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeVox, readVox } from "../src/lib/voxel/vox.mjs";
// @ts-ignore: módulo JavaScript de las Forge Tools
import { parseVox, info, check, paletteOut, recolor, render, main } from "../forge-tools/vox/forja-vox.mjs";

const cube = (n: number, c: string) => {
  const v = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) v.push({ x, y, z, c });
  return v;
};

test("forja-vox lee lo mismo que el lector de la academia", () => {
  const bytes = writeVox([...cube(3, "#a0603a"), { x: 1, y: 1, z: 3, c: "#f2c14e" }]);
  const a = parseVox(bytes), b = readVox(bytes);
  const r = info(a);
  assert.deepEqual(r.tamaño, b.size);
  assert.equal(r.vóxeles, b.voxels.length);
  assert.deepEqual(r.colorHex.sort(), b.colors.slice().sort());
});

test("check: un modelo sano no da errores ni avisos", () => {
  const r = check(parseVox(writeVox(cube(4, "#8f9bab"))));
  assert.equal(r.ok, true);
  assert.deepEqual(r.warnings, []);
});

test("check: avisa de un vóxel flotante y de piezas sueltas", () => {
  const r = check(parseVox(writeVox([...cube(2, "#8f9bab"), { x: 0, y: 0, z: 5, c: "#8f9bab" }])));
  assert.equal(r.ok, true);
  assert.ok(r.warnings.some((w: string) => w.includes("flotando")));
  assert.ok(r.warnings.some((w: string) => w.includes("piezas")));
});

test("check: un vóxel que solo toca en diagonal no cuenta como flotante (modelos vaciados)", () => {
  const r = check(parseVox(writeVox([...cube(2, "#8f9bab"), { x: 2, y: 2, z: 2, c: "#8f9bab" }])));
  assert.ok(!r.warnings.some((w: string) => w.includes("flotando")));
});

test("palette: exporta un .gpl con un color por línea", () => {
  const gpl = paletteOut(parseVox(writeVox([...cube(2, "#a0603a"), { x: 0, y: 0, z: 2, c: "#f2c14e" }])), "gpl").toString();
  assert.match(gpl, /^GIMP Palette/);
  assert.match(gpl, /160\s+96\s+58/); // #a0603a
  assert.match(gpl, /242\s+193\s+78/); // #f2c14e
});

test("recolor: cambia un color de la paleta y conserva los vóxeles", () => {
  const vox = parseVox(writeVox(cube(2, "#e8484f")));
  const r = recolor(vox, [["#e8484f", "#2a4fbf"]]);
  assert.equal(r.changed, 1);
  const out = readVox(r.bytes);
  assert.deepEqual(out.colors, ["#2a4fbf"]);
  assert.equal(out.voxels.length, 8);
});

test("render: varios modelos dan una hoja en fila con cuadros iguales", () => {
  const a = parseVox(writeVox(cube(2, "#4ade80"))), b = parseVox(writeVox(cube(3, "#4ade80")));
  const r = render([a, b], { size: 4, gap: 2 });
  assert.equal(r.frames, 2);
  assert.equal(r.width, r.frameWidth * 2 + 2);
  assert.deepEqual([...r.png.subarray(1, 4)].map((c: number) => String.fromCharCode(c)).join(""), "PNG");
  const four = render([a], { size: 4, angles: 4 });
  assert.equal(four.frames, 4);
});

test("la CLI devuelve 2 con un comando desconocido", () => {
  const log = console.log;
  console.log = () => {};
  try { assert.equal(main(["nada"]), 2); } finally { console.log = log; }
});

test("render: rechaza tamaños impares y ángulos que no sean 1 o 4", () => {
  const a = parseVox(writeVox(cube(2, "#4ade80")));
  assert.throws(() => render([a], { size: 3 }), /par/);
  assert.throws(() => render([a], { angles: 2 }), /1 o 4/);
});

test("render: por defecto la hoja no tiene separación (hframes cuadra en Godot)", () => {
  const a = parseVox(writeVox(cube(2, "#4ade80")));
  const r = render([a, a, a], { size: 4 });
  assert.equal(r.width, r.frameWidth * 3);
});

test("check: un modelo vaciado por dentro no cuenta como piezas sueltas", () => {
  // una caja de 3×3×3 sin el centro y con un vóxel encima que solo toca en diagonal
  const v = cube(3, "#8f9bab").filter((q) => !(q.x === 1 && q.y === 1 && q.z === 1));
  const r = check(parseVox(writeVox([...v, { x: 3, y: 3, z: 3, c: "#8f9bab" }])));
  assert.ok(!r.warnings.some((w: string) => w.includes("piezas")));
});
