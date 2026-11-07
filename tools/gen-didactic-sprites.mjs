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

// ---------- luz: pillow shading frente a una luz con dirección (16×16)
import { shadeSphere } from "../src/lib/pixel/shade.mjs";
const BALL = ["#2b1a3d", "#5b2a6e", "#a4407e", "#e8789a"]; // de sombra a luz
const ballKeys = ["1", "2", "3", "4"];
function ballRows(grid) {
  return grid.map((row) => row.map((v) => (v === -1 ? "." : v === -2 ? "o" : ballKeys[v])).join(""));
}
const lit = shadeSphere({ size: 16, angle: 135, elevation: 40, tones: 4, outline: true, bounce: true });
add("ball-lit", "Bola de 16×16 sombreada con UNA luz desde arriba a la izquierda: luz, terminador, sombra propia y luz rebotada abajo a la derecha.", ["luz"],
  { o: "#140c1c", "1": BALL[0], "2": BALL[1], "3": BALL[2], "4": BALL[3] }, ballRows(lit));
// pillow shading: los tonos dependen solo de la distancia al centro (anillos), no de una luz
const pillow = lit.map((row, y) => row.map((v, x) => {
  if (v < 0) return v;
  const d = Math.hypot(x - 7.5, y - 7.5) / 7.5;
  return d < 0.35 ? 3 : d < 0.6 ? 2 : d < 0.82 ? 1 : 0;
}));
add("ball-pillow", "La misma bola con pillow shading: anillos concéntricos oscuros hacia el borde, como si la luz viniera del espectador. Se ve plana e hinchada.", ["luz", "error"],
  { o: "#140c1c", "1": BALL[0], "2": BALL[1], "3": BALL[2], "4": BALL[3] }, ballRows(pillow));

// ---------- contornos: negro, selout (contorno del color de su zona, más oscuro) y sin contorno
const mush = out.find((s) => s.name === "mushroom16");
const darker = { r: "#5c1426", d: "#4a1020", w: "#8a6d4a", c: "#6e5636" }; // versión oscura de cada relleno
function outlineVariant(mode) {
  const rows = mush.rows.map((r) => [...r]);
  const H = rows.length, W = rows[0].length;
  const fillNear = (x, y) => {
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const c = mush.rows[y + dy]?.[x + dx];
      if (c && c !== "." && c !== "o") return c;
    }
    return "r";
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (mush.rows[y][x] !== "o") continue;
    if (mode === "none") rows[y][x] = fillNear(x, y);
    else if (mode === "selout") rows[y][x] = fillNear(x, y).toUpperCase(); // R, D, W, C = versiones oscuras
  }
  return rows.map((r) => r.join(""));
}
const seloutPal = { ...SETA };
for (const [k, v] of Object.entries(darker)) seloutPal[k.toUpperCase()] = v;
{
  const rows = outlineVariant("selout");
  const used = new Set(rows.join(""));
  add("mushroom16-selout", "La seta con selout: el contorno usa una versión oscura del color de cada zona, en vez de negro. Más suave e integrada.", ["contorno"],
    Object.fromEntries(Object.entries(seloutPal).filter(([k]) => used.has(k))), rows);
}
{
  const rows = outlineVariant("none");
  const used = new Set(rows.join(""));
  add("mushroom16-nooutline", "La seta sin contorno: sobre fondos de colores parecidos se pierde la forma.", ["contorno", "error"],
    Object.fromEntries(Object.entries(SETA).filter(([k]) => used.has(k))), rows);
}

// ---------- antialiasing selectivo: disco oscuro sobre fondo claro, sin y con AA (12×12)
function disc(aa) {
  const N = 12, rows = [];
  for (let y = 0; y < N; y++) {
    let r = "";
    for (let x = 0; x < N; x++) {
      // cobertura: cuántos de 4×4 subpíxeles caen dentro del círculo
      let inside = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (Math.hypot(x + (sx + 0.5) / 4 - 6, y + (sy + 0.5) / 4 - 6) <= 5) inside++;
      const cov = inside / 16;
      r += cov >= 0.5 ? (aa && cov < 0.8 ? "m" : "f") : aa && cov >= 0.25 ? "m" : "b";
    }
    rows.push(r);
  }
  return rows;
}
add("disc-noaa", "Disco de 12×12 sin antialiasing: los escalones del borde se ven duros.", ["antialiasing"], { b: "#e8dcc8", f: "#3b2a5a" }, disc(false));
add("disc-aa", "El mismo disco con antialiasing selectivo: un tono intermedio SOLO en los escalones largos suaviza la curva a 1×.", ["antialiasing"], { b: "#e8dcc8", f: "#3b2a5a", m: "#9283a0" }, disc(true));

// ---------- materiales: la MISMA forma (bola de 16×16, misma luz) con reglas de cada material
// Lo que cambia entre materiales no es la forma, sino CÓMO responden a la luz:
//  · metal: contraste muy alto, reflejo especular duro y una banda oscura (el «horizonte» reflejado)
//  · piedra/mate: contraste suave, sin brillo especular
//  · cristal: casi transparente (canal alfa), contorno claro y brillos puntuales
const matLit = shadeSphere({ size: 16, angle: 135, elevation: 40, tones: 4, outline: true, bounce: false });
{
  const rows = matLit.map((row, y) => row.map((v, x) => {
    if (v === -1) return ".";
    if (v === -2) return "o";
    if (y >= 8 && y <= 9 && v >= 1) return "1"; // banda de horizonte: el metal refleja el suelo oscuro
    if (v === 3 && (x - 4.5) ** 2 + (y - 4.5) ** 2 <= 1.6) return "5"; // reflejo especular: pequeño y duro
    return String(v + 1);
  }).join(""));
  add("mat-metal", "Bola de metal: contraste muy alto, un reflejo especular blanco y una banda oscura en el centro (el horizonte reflejado).", ["material"],
    { o: "#10131a", "1": "#1f2733", "2": "#5f6b7d", "3": "#b9c4d2", "4": "#e6edf5", "5": "#ffffff" }, rows);
}
{
  const rows = matLit.map((row) => row.map((v) => (v === -1 ? "." : v === -2 ? "o" : String(Math.min(2, v) + 1))).join(""));
  add("mat-mate", "La misma bola en un material mate (piedra, arcilla): contraste suave, solo 3 tonos y ningún brillo especular.", ["material"],
    { o: "#1d1a24", "1": "#5e5a6b", "2": "#7d788c", "3": "#9b96aa" }, rows);
}
{
  const rows = matLit.map((row, y) => row.map((v, x) => {
    if (v === -1) return ".";
    if (v === -2) return "o";
    if ((x === 4 && y === 4) || (x === 5 && y === 4) || (x === 4 && y === 5)) return "h"; // brillo principal
    if (x === 11 && y === 11) return "h"; // brillo secundario (reflejo interior)
    return v <= 1 ? "d" : "g";
  }).join(""));
  add("mat-glass", "Bola de cristal: el interior es semitransparente (se ve el fondo), contorno claro y brillos puntuales opuestos.", ["material"],
    { o: "#cdeaff", g: "#9fd8ff40", d: "#5aa8e070", h: "#ffffff" }, rows);
}
add("mat-wood", "Tablón de madera de 16×10: tres tonos cálidos y vetas horizontales que siguen la longitud de la tabla.", ["material"],
  { o: "#2a160c", l: "#c98a4e", m: "#a0663a", d: "#6e4126" }, [
    "oooooooooooooooo",
    "olllllmmllllllmo",
    "ommmmmmddmmmmmmo",
    "olllllllllmmlllo",
    "ommddmmmmmmmmmmo",
    "omllllllllllllmo",
    "ommmmmmmmddmmmmo",
    "olllmmlllllllllo",
    "oddddddddddddddo",
    "oooooooooooooooo",
  ]);

// ---------- personajes: héroe chibi 16×24 frente a proporciones realistas
const HERO = {
  o: "#1b1030", s: "#f2c29b", S: "#c98f6b", h: "#6b3d2e", H: "#a0603a",
  t: "#3b6fd1", T: "#26489a", b: "#6b3d2e", p: "#4a4560", P: "#2f2b40", B: "#3b2418",
};
add("hero-chibi", "Héroe chibi de 16×24: la cabeza ocupa casi la mitad de la altura. Caben ojos de 2 px, pelo con luz y una silueta clara de cuerpo y piernas.", ["personaje"], HERO, [
  "................",
  "................",
  "................",
  "....oooooooo....",
  "...ohhHHHhhho...",
  "..ohhHHHHHhhhho.",
  "..ohhhhhhhhhhho.",
  "..ohhsssssssshho".slice(0, 16),
  "..ohssssssssSho.",
  "..ohsosssosssho.",
  "..ohsosssosssho.",
  "..oSssssssssSSo.",
  "...oSSsssssSSo..",
  "....oooooooo....",
  "...otttttttto...",
  "..ostttttttTso..",
  "..ostttttttTso..",
  "..oSbbbbbbbbSo..",
  "...otttttttTo...",
  "...opppppppPo...",
  "...oppPo.opPPo..",
  "...oppPo.opPPo..",
  "...oBBBo.oBBBo..",
  "...ooooo.ooooo..",
].map((r) => r.padEnd(16, ".").slice(0, 16)));
add("hero-realistic", "El mismo héroe con proporciones realistas en 16×24: la cabeza mide 4 px y no cabe una cara. A esta resolución se pierde el personaje.", ["personaje", "error"],
  { o: HERO.o, s: HERO.s, h: HERO.h, t: HERO.t, T: HERO.T, b: HERO.b, p: HERO.p, P: HERO.P, B: HERO.B }, [
  "......oooo......",
  ".....ohhhho.....",
  ".....oshsso.....",
  ".....ossso......",
  "......oso.......",
  "....ootttoo.....",
  "...osotttToso...",
  "...osotttToso...",
  "...osotttToso...",
  "...osotttToso...",
  "....obbbbbo.....",
  "....otttttTo....",
  "....oppppPo.....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....opPoopPo....",
  "....oBBooBBo....",
  "....oooooooo....",
  "................",
]);

// ---------- expresiones: la misma cabeza de 12×11, solo cambian cejas, ojos y boca
const FACE_BASE = [
  "..oooooooo..",
  ".ohhHHHhhho.",
  "ohhhhhhhhhho",
  "ohhsssssshho",
  "ohsssssssSho",
  "ohsssssssSho",
  "ohsssssssSho",
  "oSsssssssSSo",
  "oSsssssssSSo",
  ".oSSsssssSo.",
  "..oooooooo..",
];
function face(marks) {
  const g = FACE_BASE.map((r) => [...r]);
  for (const [x, y] of marks) g[y][x] = "o";
  return g.map((r) => r.join(""));
}
const FACE_PAL = { o: HERO.o, s: HERO.s, S: HERO.S, h: HERO.h, H: HERO.H };
const EXPRESSIONS = {
  neutral: { d: "Neutral: ojos de 2 px y una boca corta y recta.", m: [[3, 5], [3, 6], [8, 5], [8, 6], [5, 8], [6, 8]] },
  // la sonrisa va una fila más abajo que en el primer intento: así el arco del ojo no toca la comisura
  alegre: { d: "Alegre: ojos en arco (^ ^) y la boca con las comisuras hacia arriba.", m: [[3, 5], [2, 6], [4, 6], [8, 5], [7, 6], [9, 6], [4, 8], [7, 8], [5, 9], [6, 9]] },
  enfado: { d: "Enfado: cejas que bajan hacia el centro, ojos fijos y la boca recta y apretada.", m: [[2, 4], [4, 5], [9, 4], [7, 5], [3, 6], [8, 6], [4, 8], [5, 8], [6, 8], [7, 8]] },
  triste: { d: "Triste: cejas que suben hacia el centro y la boca con las comisuras hacia abajo.", m: [[4, 4], [2, 5], [7, 4], [9, 5], [3, 6], [8, 6], [5, 8], [6, 8], [4, 9], [7, 9]] },
  sorpresa: { d: "Sorpresa: ojos más altos (3 px) y la boca abierta en una O.", m: [[3, 4], [3, 5], [3, 6], [8, 4], [8, 5], [8, 6], [5, 8], [6, 8], [5, 9], [6, 9]] },
};
for (const [k, e] of Object.entries(EXPRESSIONS)) add(`face-${k}`, e.d, ["expresión"], FACE_PAL, face(e.m));

// ---------- enemigo: murciélago (formas angulosas) frente al slime (formas redondas)
add("bat", "Murciélago enemigo de 12×8: alas en picos y ojos rojos. Formas triangulares: se lee como amenaza aunque sea pequeño.", ["criatura", "enemigo"],
  { o: "#1b1030", w: "#5b4a7a", b: "#3a2d52", R: "#ff4f4f" }, [
  "o....oo....o",
  "oo..obbo..oo",
  "owo.oRRo.owo",
  "owwoobboowwo",
  "owwwwbbwwwwo",
  ".owwwbbwwwo.",
  "..oowoowoo..",
  "....o..o....",
]);

// ---------- escribir y validar
let bad = 0;
for (const s of out) {
  const e = validateSprite(s, s.name);
  if (e.length) { bad++; console.error(e.join("\n")); continue; }
  writeFileSync(`art-src/sprites/${s.name}.sprite.json`, JSON.stringify(s, null, 2) + "\n");
}
console.log(`${out.length - bad} sprites didácticos escritos en art-src/sprites/`);
if (bad) process.exit(1);
