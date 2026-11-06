// Tests del análisis de sprites. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { analyzeSprite, rgbaToSprite } from "../src/lib/pixel/analyze.mjs";

const load = (n: string) => JSON.parse(readFileSync(`art-src/sprites/${n}.sprite.json`, "utf8"));

const pos = (l: { x: number; y: number }[]) => l.map((o) => `${o.x},${o.y}`).sort();

test("huérfano: sin vecino igual ni en diagonal; suelto: solo en diagonal", () => {
  const r = analyzeSprite({ palette: { a: "#000000", b: "#ffffff" }, rows: ["aab", "aaa", "b.."] });
  assert.deepEqual(pos(r.orphans), ["0,2", "2,0"]);
  assert.equal(r.clusters, 3);
  assert.equal(r.colors, 2);
  const diag = analyzeSprite({ palette: { o: "#000000" }, rows: ["o..", ".o.", "..o"] });
  assert.equal(diag.orphans.length, 0, "una diagonal no es huérfana");
  assert.equal(diag.loose.length, 3);
});

test("los sprites limpios del curso no tienen huérfanos, salvo brillos y ojos intencionados", () => {
  for (const n of ["chest", "mushroom16", "rock-clean", "circle-clean"]) assert.equal(analyzeSprite(load(n)).orphans.length, 0, n);
  // un único píxel de brillo es un huérfano a propósito
  assert.deepEqual(analyzeSprite(load("gem")).orphans.map((o: { ch: string }) => o.ch), ["4"]);
  assert.deepEqual(analyzeSprite(load("slime")).orphans.map((o: { ch: string }) => o.ch), ["e", "e"]);
});

test("la roca ruidosa tiene muchos más píxeles sueltos que la limpia", () => {
  const clean = analyzeSprite(load("rock-clean"));
  const noisy = analyzeSprite(load("rock-noisy"));
  assert.ok(noisy.loose.length > clean.loose.length + 10, `limpia ${clean.loose.length}, ruidosa ${noisy.loose.length}`);
});

test("una imagen RGBA se convierte en sprite (transparencia incluida)", () => {
  const data = new Uint8Array([255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 255, 255]);
  const s = rgbaToSprite(2, 2, data)!;
  assert.deepEqual(s.rows, ["a.", "ab"]);
  assert.deepEqual(s.palette, { a: "#ff0000", b: "#0000ff" });
});
