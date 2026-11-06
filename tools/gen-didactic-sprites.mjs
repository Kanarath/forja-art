// Genera los sprites DIDÁCTICOS de las lecciones (líneas, curvas, huérfanos, formas, valor…)
// como archivos art-src/sprites/*.sprite.json.   node tools/gen-didactic-sprites.mjs
//
// Algunos se construyen con reglas exactas (una línea 2:1 son tramos de 2 píxeles) y otros
// están dibujados a mano aquí mismo, fila a fila. En ambos casos el resultado es DATO puro:
// se puede abrir el JSON y contar los píxeles. Se ejecuta a mano; su salida se versiona.
import { writeFileSync } from "node:fs";
import { validateSprite } from "../src/lib/pixel/sprite.mjs";

const LICENSE = "CC0 · creado como datos para FORJA//ART";
const out = [];
const add = (name, description, tags, palette, rows) => out.push({ name, description, license: LICENSE, tags: ["didáctico", ...tags], palette, rows });

// ---------- líneas: cada número es un tramo horizontal; después se baja 1 píxel
function lineFromRuns(runs, { doubled = false } = {}) {
  const w = runs.reduce((a, b) => a + b, 0) + (doubled ? 1 : 0), h = runs.length;
  const g = Array.from({ length: h }, () => Array(w).fill("."));
  let x = 0;
  runs.forEach((r, y) => {
    for (let i = 0; i < r; i++) g[y][x + i] = "o";
    if (doubled && y < h - 1) g[y][x + r] = "o"; // píxel de más en la «esquina»: forma una L
    x += r;
  });
  return g.map((r) => r.join(""));
}
const INK = { o: "#1b1030" };
add("line-1-1", "Línea 1:1 (45°): un píxel por paso. Perfectamente limpia.", ["línea"], INK, lineFromRuns([1, 1, 1, 1, 1, 1, 1, 1]));
add("line-2-1", "Línea 2:1: tramos de 2 píxeles. Limpia.", ["línea"], INK, lineFromRuns([2, 2, 2, 2, 2, 2]));
add("line-3-1", "Línea 3:1: tramos de 3 píxeles. Limpia.", ["línea"], INK, lineFromRuns([3, 3, 3, 3, 3]));
add("line-jaggy", "Línea con jaggies: tramos irregulares (1, 3, 1, 2, 4, 1, 2). El ojo ve escalones.", ["línea", "error"], INK, lineFromRuns([1, 3, 1, 2, 4, 1, 2]));
add("line-doubled", "Línea 1:1 trazada a mano sin pixel-perfect: cada paso deja un píxel de más (forma de L) y engorda la línea.", ["línea", "error"], INK, lineFromRuns([1, 1, 1, 1, 1, 1, 1], { doubled: true }));
add("line-perfect", "La misma línea 1:1 con pixel-perfect: un píxel por paso.", ["línea"], INK, lineFromRuns([1, 1, 1, 1, 1, 1, 1, 1]));

// ---------- curvas (dibujadas a mano)
add("circle-clean", "Círculo de 12×12 con tramos que crecen y decrecen con orden (4, 2, 1, 1…). Se lee redondo.", ["curva"], INK, [
  "....oooo....",
  "..oo....oo..",
  ".o........o.",
  ".o........o.",
  "o..........o",
  "o..........o",
  "o..........o",
  "o..........o",
  ".o........o.",
  ".o........o.",
  "..oo....oo..",
  "....oooo....",
]);
add("circle-bumpy", "Círculo de 12×12 con tramos desordenados: bultos y esquinas. Se lee abollado.", ["curva", "error"], INK, [
  "...ooooo....",
  "..o.....oo..",
  ".o........o.",
  "o.........o.",
  "o..........o",
  "o..........o",
  ".o.........o",
  "o..........o",
  ".o........o.",
  "..o......o..",
  "..oo...oo...",
  "....ooo.....",
]);

// ---------- huérfanos y clusters (roca sombreada)
const ROCK = { o: "#1b1030", "1": "#4a4560", "2": "#7d7896", "3": "#b9b4cc" };
add("rock-clean", "Roca con el sombreado en grupos (clusters) limpios: luz arriba a la izquierda.", ["clusters"], ROCK, [
  "...oooo...",
  "..o3333o..",
  ".o333322o.",
  "o33332222o",
  "o33222221o",
  "o22222111o",
  ".o211111o.",
  "..oooooo..",
]);
add("rock-noisy", "La misma roca con píxeles sueltos alternados: ruido, se pierde el volumen.", ["clusters", "error"], ROCK, [
  "...oooo...",
  "..o3233o..",
  ".o323232o.",
  "o32323212o",
  "o23232121o",
  "o21212111o",
  ".o212121o.",
  "..oooooo..",
]);

// ---------- siluetas
add("flask-bad", "Frasco sin cuello: en silueta parece una pelota, no una poción.", ["silueta", "error"], { o: "#1b1030", r: "#e0245e", d: "#8a1040", h: "#ffffff" }, [
  "...oooo...",
  ".oorrrroo.",
  "orhrrrrrdo",
  "orhrrrrrdo",
  "orrrrrrrdo",
  "orrrrrrddo",
  ".orrrrddo.",
  "..oooooo..",
]);

// ---------- resolución: la misma seta a 8×8 y 16×16
const SETA = { o: "#2a1020", r: "#d8343f", d: "#8e1f35", w: "#f4e6c8", c: "#c9b08a" };
add("mushroom8", "Seta a 8×8: solo cabe lo esencial (sombrero, motas, pie).", ["resolución"], { o: SETA.o, r: SETA.r, w: SETA.w }, [
  "..oooo..",
  ".orrwro.",
  "orwrrrro",
  "oooooooo",
  "..owwo..",
  "..owwo..",
  "..owwo..",
  "..oooo..",
]);
add("mushroom16", "La misma seta a 16×16: hay sitio para sombra, motas con forma y volumen en el pie.", ["resolución"], SETA, [
  ".....oooooo.....",
  "...oorrrrrroo...",
  "..orrwwrrrrrro..",
  ".orrwwwwrrrwwro.",
  ".orrrwwrrrrwwro.",
  "orrrrrrrrrrrrrdo",
  "orrwwrrrrrrrrddo",
  "odddrrrrrrrddddo",
  ".oooooooooooooo.",
  ".....owwwwo.....",
  ".....owwwco.....",
  ".....owwwco.....",
  ".....owwwco.....",
  "....owwwwwco....",
  "....oooooooo....",
  "................",
]);

// ---------- lenguaje de formas (12×12)
function shape(kind) {
  const N = 12, g = [];
  for (let y = 0; y < N; y++) {
    let row = "";
    for (let x = 0; x < N; x++) {
      const cx = x - 5.5, cy = y - 5.5;
      let inside, edge;
      if (kind === "circle") { const d = Math.hypot(cx, cy); inside = d <= 5.7; edge = d > 4.7; }
      else if (kind === "square") { inside = x >= 1 && x <= 10 && y >= 1 && y <= 10; edge = x === 1 || x === 10 || y === 1 || y === 10; }
      else { const half = (y / (N - 1)) * 5.5 + 0.3; inside = Math.abs(cx) <= half; edge = Math.abs(cx) > half - 1.2 || y === N - 1; }
      row += inside ? (edge ? "o" : "f") : ".";
    }
    g.push(row);
  }
  return g;
}
add("shape-circle", "Círculo: forma amable, blanda, segura.", ["formas"], { o: "#1b1030", f: "#6ee59f" }, shape("circle"));
add("shape-square", "Cuadrado: forma estable, sólida, fiable.", ["formas"], { o: "#1b1030", f: "#38b6ff" }, shape("square"));
add("shape-triangle", "Triángulo: forma dinámica, peligrosa, agresiva.", ["formas"], { o: "#1b1030", f: "#ff6b4a" }, shape("triangle"));

// ---------- valor: la gema con tres tonos DISTINTOS pero del MISMO valor
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
};
function hslToHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return "#" + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("");
}
/** Busca el color de un tono dado cuya luminancia se acerca más a `target`. */
function colorWithLuma(h, target) {
  let best = "#000000", err = Infinity;
  for (let l = 0.05; l <= 0.95; l += 0.005) {
    const c = hslToHex(h, 0.75, l), e = Math.abs(lum(c) - target);
    if (e < err) { err = e; best = c; }
  }
  return best;
}
const gemRows = ["..11111..", ".1343321.", "133332221", ".1332221.", "..13221..", "...121...", "....1...."];
const target = lum("#ff4fa3"); // el valor del tono medio de la gema original
add("gem-samevalue", "La gema con tres colores de tono distinto pero el MISMO valor: en color se distinguen, en grises es una mancha plana.", ["valor", "error"],
  { "1": "#1b1030", "2": colorWithLuma(300, target), "3": colorWithLuma(20, target), "4": colorWithLuma(200, target) }, gemRows);

// ---------- escribir y validar
let bad = 0;
for (const s of out) {
  const e = validateSprite(s, s.name);
  if (e.length) { bad++; console.error(e.join("\n")); continue; }
  writeFileSync(`art-src/sprites/${s.name}.sprite.json`, JSON.stringify(s, null, 2) + "\n");
}
console.log(`${out.length - bad} sprites didácticos escritos en art-src/sprites/`);
if (bad) process.exit(1);
