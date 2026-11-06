// Tests de las rampas de color. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRamp, hexToHsl, hslToHex, toGpl, toHex } from "../src/lib/pixel/ramp.mjs";
import { luma } from "../src/lib/pixel/analyze.mjs";

test("hex ↔ hsl ida y vuelta", () => {
  for (const c of ["#ff4fa3", "#38e1ff", "#1b1030", "#808080"]) assert.equal(hslToHex(hexToHsl(c)), c);
});

test("una rampa va de oscuro a claro (valor siempre creciente)", () => {
  const r = buildRamp("#c2186b", 6);
  assert.equal(r.length, 6);
  for (let i = 1; i < r.length; i++) assert.ok(luma(r[i]) > luma(r[i - 1]), `${r[i - 1]} → ${r[i]}`);
});

test("con hue shifting, la sombra se enfría y la luz se calienta", () => {
  const flat = buildRamp("#3fbf7f", 5, 0), shifted = buildRamp("#3fbf7f", 5, 0.6);
  const h = (c: string) => hexToHsl(c).h;
  assert.ok(h(shifted[0]) > h(flat[0]), "la sombra gira hacia el azul (250°)"); // verde 150° → hacia 250°
  assert.ok(h(shifted[4]) < h(flat[4]), "la luz gira hacia el amarillo (60°)");
});

test("exporta .gpl y .hex", () => {
  const gpl = toGpl(["#ff0000", "#00ff00"], "Prueba");
  assert.match(gpl, /^GIMP Palette\nName: Prueba/);
  assert.match(gpl, /255   0   0\tPrueba 1/);
  assert.equal(toHex(["#ff0000", "#00ff00"]), "ff0000\n00ff00\n");
});
