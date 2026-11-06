// Tests de dithering y sombreado. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { ditherGradient, shadeSphere, rng } from "../src/lib/pixel/shade.mjs";

const share = (rows: string[], from: number, to: number) => {
  let b = 0, n = 0;
  for (const r of rows) for (let x = from; x < to; x++) { n++; if (r[x] === "b") b++; }
  return b / n;
};

test("todos los métodos van de A (izquierda) a B (derecha)", () => {
  for (const m of ["none", "checker", "bayer2", "bayer4", "noise"]) {
    const g = ditherGradient(m, 32, 8);
    assert.ok(share(g, 0, 4) < 0.25, `${m}: el inicio debe ser casi todo A`);
    assert.ok(share(g, 28, 32) > 0.75, `${m}: el final debe ser casi todo B`);
  }
});

test("sin dithering hay un único corte; con Bayer, la mezcla crece de forma ordenada", () => {
  const none = ditherGradient("none", 32, 4);
  assert.ok(none.every((r) => /^a+b+$/.test(r)), "un solo salto de A a B en cada fila");
  const b4 = ditherGradient("bayer4", 32, 4);
  const q = [share(b4, 0, 8), share(b4, 8, 16), share(b4, 16, 24), share(b4, 24, 32)];
  for (let i = 1; i < q.length; i++) assert.ok(q[i] > q[i - 1], `Bayer crece por cuartos: ${q.join(", ")}`);
});

test("el ruido es determinista con la misma semilla", () => {
  assert.deepEqual(ditherGradient("noise", 16, 4, 3), ditherGradient("noise", 16, 4, 3));
  const r = rng(1);
  assert.notEqual(r(), r());
});

test("la esfera es más clara del lado de la luz", () => {
  const g = shadeSphere({ size: 16, angle: 180, elevation: 20, tones: 4, outline: false, bounce: false }); // luz desde la izquierda
  const mid = 8;
  assert.ok(g[mid][2] > g[mid][13], `izquierda ${g[mid][2]} > derecha ${g[mid][13]}`);
  assert.equal(g[0][0], -1, "las esquinas están fuera de la esfera");
  const tonesUsed = new Set(g.flat().filter((v: number) => v >= 0));
  assert.ok(tonesUsed.size <= 4);
});

test("la luz rebotada aclara el borde en sombra un tono, sin llegar a la luz", () => {
  const opts = { size: 20, angle: 135, elevation: 30, tones: 4, outline: false };
  const off = shadeSphere({ ...opts, bounce: false }), on = shadeSphere({ ...opts, bounce: true });
  // borde inferior derecho, lejos de la luz
  const [x, y] = [16, 16];
  assert.equal(off[y][x], 0);
  assert.equal(on[y][x], 1);
});

test("con contorno, el borde se marca y el interior conserva los tonos", () => {
  const g = shadeSphere({ size: 12, outline: true });
  const flat = g.flat();
  assert.ok(flat.includes(-2));
  assert.ok(flat.some((v: number) => v >= 0));
});
