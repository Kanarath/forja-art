// Genera los sprites DIDÁCTICOS de las lecciones (líneas, curvas, huérfanos, formas, valor…)
// como archivos art-src/sprites/*.sprite.json.   node tools/gen-didactic-sprites.mjs
//
// Algunos se construyen con reglas exactas (una línea 2:1 son tramos de 2 píxeles) y otros
// están dibujados a mano aquí mismo, fila a fila. En ambos casos el resultado es DATO puro:
// se puede abrir el JSON y contar los píxeles. Se ejecuta a mano; su salida se versiona.
import { writeFileSync, readFileSync } from "node:fs";
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

// ---------- animación del héroe: respirar, parpadear y caminar (de frente)
// Todos los frames salen del MISMO héroe chibi: así se ve qué píxeles cambian y cuáles no.
const heroRows = out.find((s) => s.name === "hero-chibi").rows;
const blankRow = ".".repeat(16);
// respirar: cabeza y torso bajan 1 px (desaparece una fila de túnica); las piernas no se mueven
add("hero-breathe", "Frame de respiración: cabeza y torso bajan 1 píxel y la túnica pierde una fila; las piernas quedan quietas. Alternado con el héroe base, es un idle.", ["personaje", "animación"], HERO,
  [blankRow, ...heroRows.slice(0, 18), ...heroRows.slice(19)]);
// parpadeo: el ojo de 2 px pasa a ser una línea de 1 px
add("hero-blink", "Frame de parpadeo: cada ojo pasa de 2 píxeles de alto a 1. Dura muy poco (unos 100 ms).", ["personaje", "animación"], HERO,
  heroRows.map((r, y) => (y === 9 ? r.slice(0, 5) + "s" + r.slice(6, 9) + "s" + r.slice(10) : r)));
// paso: todo el héroe sube 1 px (el rebote) y una pierna se estira hasta el suelo mientras la otra queda levantada
function walkStep(planted) {
  const up = [...heroRows.slice(1), blankRow].map((r) => [...r]);
  const [x0, x1] = planted === "left" ? [3, 7] : [9, 13];
  for (let y = 19; y <= 23; y++) for (let x = x0; x <= x1; x++) up[y][x] = heroRows[Math.max(20, y)][x];
  return up.map((r) => r.join(""));
}
add("hero-walk-a", "Paso con la pierna izquierda apoyada: el cuerpo sube 1 píxel y el pie derecho queda levantado. Va entre dos frames del héroe base.", ["personaje", "animación"], HERO, walkStep("left"));
add("hero-walk-b", "Paso con la pierna derecha apoyada: el espejo del anterior. Base → paso A → base → paso B es un ciclo de caminar de 4 frames.", ["personaje", "animación"], HERO, walkStep("right"));

// ---------- tiles de 16×16: costuras y repetición (envuelven: lo que sale por un borde entra por el otro)
const GRASS = { g: "#3fa45b", d: "#2c7a48", l: "#6fd17f" };
function grassTile({ bevel = false, flower = false } = {}) {
  const g = Array.from({ length: 16 }, () => Array(16).fill("g"));
  const set = (x, y, c) => { g[((y % 16) + 16) % 16][((x % 16) + 16) % 16] = c; };
  // matas: un píxel claro arriba y dos oscuros abajo; algunas cruzan el borde a propósito
  for (const [x, y] of [[2, 3], [9, 1], [13, 6], [5, 9], [11, 12], [15, 14], [1, 15], [7, 5]]) {
    set(x + 1, y, "l"); set(x, y + 1, "d"); set(x + 2, y + 1, "d");
  }
  if (bevel) for (let i = 0; i < 16; i++) { g[0][i] = "l"; g[i][0] = "l"; g[15][i] = "d"; g[i][15] = "d"; }
  const pal = { ...GRASS };
  if (flower) {
    Object.assign(pal, { w: "#fff3c4", y: "#ffb84d" });
    for (const [x, y, c] of [[7, 6, "w"], [6, 7, "w"], [8, 7, "w"], [7, 8, "w"], [7, 7, "y"]]) g[y][x] = c;
  }
  return { pal, rows: g.map((r) => r.join("")) };
}
{
  const t = grassTile();
  add("tile-grass", "Tile de hierba de 16×16 sin costuras: las matas que salen por un borde entran por el opuesto y ninguna llama la atención. Repetido, se lee como un prado.", ["tile"], t.pal, t.rows);
  const b = grassTile({ bevel: true });
  add("tile-grass-bevel", "El mismo tile con los bordes iluminados arriba y a la izquierda y oscurecidos abajo y a la derecha. Solo, parece bonito; repetido, dibuja una cuadrícula.", ["tile", "error"], b.pal, b.rows);
  const f = grassTile({ flower: true });
  add("tile-grass-flower", "El tile sin costuras con una flor clara en el centro. No tiene costuras, pero repetido la flor forma una retícula: el ojo detecta el patrón.", ["tile", "error"], f.pal, f.rows);
}

// ---------- perspectivas: la misma caja de madera vista de lado, en 3/4 y en isométrica
const CRATE = { o: "#1b1030", L: "#d08a50", M: "#a0603a", D: "#6b3d2e" };
const frontFace = (h) => [ // cara frontal de 12 de ancho: marco oscuro y tablas horizontales
  "oDDDDDDDDDDo",
  ...Array.from({ length: h - 2 }, (_, i) => (i % 3 === 2 ? "oDDDDDDDDDDo" : "oDMMMMMMMMDo")),
  "oooooooooooo",
];
add("view-side", "La caja vista de lado (vista lateral, como un plataformas): solo la cara frontal. No hay suelo visible: el suelo es una línea.", ["perspectiva"], { o: CRATE.o, M: CRATE.M, D: CRATE.D },
  ["oooooooooooo", ...frontFace(11)]);
add("view-34", "La misma caja en top-down 3/4 (la vista de los JRPG): se ve la tapa arriba y la cara frontal algo más baja que en la vista lateral.", ["perspectiva"], CRATE,
  ["oooooooooooo", "oLLLLLLLLLLo", "oMMMMMMMMMMo", "oLLLLLLLLLLo", ...frontFace(8)]);
{
  // cubo isométrico 2:1 de 16×16: rombo de arriba, cara izquierda (media) y derecha (oscura)
  const hw = (y) => (y < 4 ? 2 * (y + 1) : y < 12 ? 8 : 2 * (16 - y));
  const inside = (x, y) => y >= 0 && y < 16 && x >= 8 - hw(y) && x <= 7 + hw(y);
  const top = (x, y) => y < 8 && x >= 8 - (y < 4 ? 2 * (y + 1) : 2 * (8 - y)) && x <= 7 + (y < 4 ? 2 * (y + 1) : 2 * (8 - y));
  const rows = [];
  for (let y = 0; y < 16; y++) {
    let r = "";
    for (let x = 0; x < 16; x++) {
      if (!inside(x, y)) { r += "."; continue; }
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      r += edge ? "o" : top(x, y) ? "L" : x < 8 ? "M" : "D";
    }
    rows.push(r);
  }
  add("view-iso", "La misma caja en isométrica de píxel (líneas 2:1): se ven la tapa y dos caras, cada una con su tono. Ninguna cara mira de frente.", ["perspectiva"], CRATE, rows);
}

// ---------- composición: la misma escena montada sin foco y con foco
// Se compone a partir de sprites reales sobre la hierba; la paleta se reconstruye al final.
const spriteByName = (n) => out.find((s) => s.name === n) ?? JSON.parse(readFileSync(`art-src/sprites/${n}.sprite.json`, "utf8"));
function compose(w, h, groundPal, placements) {
  const tile = grassTile();
  const px = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => groundPal[tile.rows[y % 16][x % 16]]));
  for (const [name, x0, y0] of placements) {
    const s = spriteByName(name);
    s.rows.forEach((r, y) => [...r].forEach((k, x) => { if (k !== "." && px[y0 + y]?.[x0 + x] !== undefined) px[y0 + y][x0 + x] = s.palette[k]; }));
  }
  const keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const pal = {}, byHex = {};
  const rows = px.map((r) => r.map((hex) => {
    if (!byHex[hex]) { byHex[hex] = keys[Object.keys(pal).length]; pal[byHex[hex]] = hex; }
    return byHex[hex];
  }).join(""));
  return { pal, rows };
}
{
  const flat = compose(64, 40, GRASS, [["chest", 4, 4], ["mushroom8", 28, 4], ["rock-clean", 50, 4], ["hero-chibi", 24, 8], ["slime", 6, 28], ["potion", 50, 26]]);
  add("scene-flat", "Escena de 64×40 sin foco: el héroe en el centro exacto y los demás elementos repartidos por igual, todos con el mismo contraste sobre una hierba de valor medio. El ojo no sabe dónde mirar.", ["escena", "composición", "error"], flat.pal, flat.rows);
  const DARK = { g: "#24563a", d: "#1a4030", l: "#3a7a50" }; // la misma hierba, más oscura y menos saturada
  const focus = compose(64, 40, DARK, [["rock-clean", 0, 32], ["mushroom8", 8, 31], ["hero-chibi", 18, 10], ["slime", 44, 22], ["rock-clean", 54, 0], ["mushroom8", 57, 9]]);
  add("scene-focus", "La misma escena con foco: el héroe en el tercio izquierdo frente al slime, la hierba más oscura para que los personajes destaquen y rocas y setas en las esquinas enmarcando. Menos elementos, una historia.", ["escena", "composición"], focus.pal, focus.rows);
}

// ---------- squash & stretch: el salto del slime (lienzo de 16×20, el suelo es la última fila)
// La forma se calcula: una cúpula apoyada (o una elipse en el aire) de ancho w y alto h.
// El volumen se conserva a ojo: si se aplasta, se ensancha; si se estira, se estrecha.
const SLIME_PAL = { o: "#1b1030", g: "#4ade80", G: "#1f8a4c", h: "#d8ffe6", e: "#1b1030" };
function slimeFrame(w, h, bottom, { air = false } = {}) {
  const W = 16, H = 20, cx = W / 2;
  const inside = (x, y) => {
    if (y > bottom || y < bottom - h + 1) return false;
    const t = air ? Math.abs((bottom - y) - (h - 1) / 2) / (h / 2) : (bottom - y + 0.5) / h; // 0 abajo/centro → 1 arriba
    const hw = (w / 2) * Math.sqrt(Math.max(0, 1 - t * t)) + (air ? 0.15 : 0.35);
    return Math.abs(x + 0.5 - cx) <= hw;
  };
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    if (!inside(x, y)) return ".";
    const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    return edge ? "o" : "g";
  }));
  const rowsIn = []; // filas con interior
  g.forEach((r, y) => { if (r.includes("g")) rowsIn.push(y); });
  const first = rowsIn[0], last = rowsIn[rowsIn.length - 1];
  // ojos: a media altura del interior, separados 3 píxeles (nunca en la primera ni en la última fila)
  const ey = rowsIn[Math.max(1, Math.min(rowsIn.length - 2, Math.floor((rowsIn.length - 1) / 2)))];
  for (const x of [6, 9]) g[ey][x] = "e";
  // brillo: los dos primeros píxeles interiores de la primera fila (luz arriba a la izquierda)
  const hx = g[first].indexOf("g");
  g[first][hx] = "h"; if (g[first][hx + 1] === "g") g[first][hx + 1] = "h";
  // sombra: la última fila interior
  for (let x = 0; x < W; x++) if (g[last][x] === "g") g[last][x] = "G";
  return g.map((r) => r.join(""));
}
add("slime-rest", "Slime en reposo dentro de un lienzo de 16×20: 10 de ancho y 8 de alto, apoyado en la última fila. Es el frame de partida y de llegada del salto.", ["criatura", "animación"], SLIME_PAL, slimeFrame(10, 8, 19));
add("slime-squash", "Anticipación (y aterrizaje): el slime se aplasta a 5 de alto y se ensancha a 14. Ocupa más o menos lo mismo que en reposo: el volumen se conserva.", ["criatura", "animación"], SLIME_PAL, slimeFrame(14, 5, 19));
add("slime-stretch", "Despegue: el slime se estira a 11 de alto y se estrecha a 7, ya separado del suelo. La forma dice hacia dónde va.", ["criatura", "animación"], SLIME_PAL, slimeFrame(7, 11, 16, { air: true }));
add("slime-apex", "Punto más alto del salto: el slime recupera su forma redonda y queda un instante quieto arriba.", ["criatura", "animación"], SLIME_PAL, slimeFrame(10, 8, 9, { air: true }));
add("slime-rigid", "Error: el mismo salto sin deformar, el slime de reposo subido 7 píxeles. Se mueve, pero parece una pieza dura, no gelatina.", ["criatura", "animación", "error"], SLIME_PAL,
  [...slimeFrame(10, 8, 19).slice(7), ...Array(7).fill(".".repeat(16))]);
add("slime-shrunk", "Error: aplastado a 5 de alto pero sin ensancharse (10 de ancho). Pierde volumen: parece que encoge en vez de aplastarse.", ["criatura", "animación", "error"], SLIME_PAL, slimeFrame(10, 5, 19));

// ---------- VFX: un impacto de 16×16 en 5 frames (destello → estallido → anillo → humo → restos)
// Cada frame es una forma sencilla; la paleta va del blanco al humo: el color también «se enfría».
const VFX = { w: "#ffffff", y: "#ffe58a", O: "#ff8f3a", r: "#d8343f", s: "#9a95ad", S: "#5c5872" };
function vfxFrame(fn) {
  return Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    const dx = x - 7.5, dy = y - 7.5;
    return fn(dx, dy, Math.hypot(dx, dy), Math.atan2(dy, dx)) ?? ".";
  }).join(""));
}
const star = (a, k) => Math.abs(Math.cos(a * k)); // 1 en las puntas
const vfx = [
  // 1: destello pequeño y muy brillante (la forma más simple: un rombo)
  vfxFrame((dx, dy) => (Math.abs(dx) + Math.abs(dy) <= 2 ? "w" : Math.abs(dx) + Math.abs(dy) <= 3 ? "y" : null)),
  // 2: estallido en estrella de 4 puntas, núcleo blanco y bordes naranjas
  vfxFrame((dx, dy, d, a) => { const r = 3 + 4.5 * star(a, 2) ** 6; return d <= 2 ? "w" : d <= r - 1.5 ? "y" : d <= r ? "O" : null; }),
  // 3: anillo que se abre con chispas en diagonal; el centro ya se ha vaciado
  vfxFrame((dx, dy, d, a) => (d >= 5 && d <= 6.6 ? (star(a + Math.PI / 4, 2) > 0.9 ? "y" : "O") : d > 6.6 && d <= 7.9 && star(a + Math.PI / 4, 2) > 0.97 ? "r" : null)),
  // 4: humo: tres bolas grises donde estuvo el anillo, con la parte de arriba algo más clara
  vfxFrame((dx, dy) => { for (const [cx, cy, r] of [[-3.5, -2.5, 2.4], [3.5, -1.5, 2.1], [0, 3.5, 2.6]]) { const d = Math.hypot(dx - cx, dy - cy); if (d <= r) return d <= r - 0.6 && dy - cy < 0.5 ? "s" : "S"; } return null; }),
  // 5: restos de humo, casi nada: el efecto se apaga en vez de cortarse
  vfxFrame((dx, dy) => { for (const [cx, cy, r] of [[-4.5, -4, 1.3], [4.5, -3, 1.1], [0.5, 5, 1.4]]) if (Math.hypot(dx - cx, dy - cy) <= r) return "S"; return null; }),
];
const usedPal = (rows) => Object.fromEntries(Object.entries(VFX).filter(([k]) => rows.some((r) => r.includes(k))));
const VFX_D = [
  "Impacto, frame 1: un destello pequeño y blanco. Dura muy poco; su trabajo es marcar el instante del golpe.",
  "Impacto, frame 2: el estallido en estrella de 4 puntas, el frame más grande y brillante.",
  "Impacto, frame 3: el centro se vacía y queda un anillo con chispas: la energía se aleja.",
  "Impacto, frame 4: humo gris donde estuvo el anillo. Los colores ya son fríos y oscuros.",
  "Impacto, frame 5: restos de humo, casi nada. El efecto se apaga en lugar de desaparecer de golpe.",
];
vfx.forEach((rows, i) => add(`vfx-hit-${i + 1}`, VFX_D[i], ["vfx", "animación"], usedPal(rows), rows));

// ---------- agua animada: un tile de 16×16 en 3 frames que también se repite sin costuras
// Las franjas oscuras están quietas; las crestas claras avanzan en x y envuelven (lo que sale por la derecha entra por la izquierda).
const WATER = { b: "#2a6fc9", d: "#1f4f9a", l: "#6fb8ff", w: "#d8f0ff" };
function waterTile(off, crests = [[0, 2], [8, 7], [3, 13], [11, 10], [6, 4]]) {
  const g = Array.from({ length: 16 }, () => Array(16).fill("b"));
  const set = (x, y, c) => { g[((y % 16) + 16) % 16][((x % 16) + 16) % 16] = c; };
  for (const [x, y] of [[1, 6], [9, 13], [12, 2], [5, 11]]) for (let k = 0; k < 4; k++) set(x + k, y, "d");
  for (const [x, y] of crests) {
    for (let k = 0; k < 3; k++) set(x + k + off, y, "l");
    set(x + 1 + off, y - 1, "w");
  }
  return g.map((r) => r.join(""));
}
[0, 1, 2].forEach((i) => add(`tile-water-${i + 1}`, `Agua, frame ${i + 1} de 3: tile de 16×16 sin costuras. Las franjas oscuras están quietas y las crestas claras avanzan ${i} píxel${i === 1 ? "" : "es"} hacia la derecha respecto al frame 1.`, ["tile", "animación"], WATER, waterTile(i)));
add("tile-water-noise", "Error: un frame de agua con las crestas en sitios distintos y sin relación con el frame 1. Alternado con él, el agua no fluye: parpadea, como si hirviera.", ["tile", "animación", "error"], WATER,
  waterTile(0, [[10, 3], [2, 9], [13, 14], [5, 1], [7, 12]]));

// ---------- materiales: la MISMA esfera de 16×16 con la misma luz (arriba a la izquierda), cuatro superficies
// Lo único que cambia es cómo responde a la luz: dónde está el brillo, cuánto contraste y qué refleja.
function sphere(shade) {
  const inside = (xx, yy) => ((xx - 7.5) / 7.2) ** 2 + ((yy - 7.5) / 7.2) ** 2 <= 1;
  return Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    if (!inside(x, y)) return ".";
    if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) return "o";
    const nx = (x - 7.5) / 6.6, ny = (y - 7.5) / 6.6, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const L = [-0.55, -0.6, 0.58]; // luz arriba a la izquierda, algo de frente
    const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
    const spec = Math.max(0, 2 * dif * nz - L[2]); // reflejo hacia la vista
    return shade({ dif, spec, nx, ny, nz });
  }).join(""));
}
const MAT_O = "#1b1030";
add("ball-mate", "Esfera mate (arcilla): la luz se reparte de forma suave en tres tonos y no hay brillo. El tono más claro ocupa una zona amplia.", ["material"],
  { o: MAT_O, "1": "#8a4a3a", "2": "#b8664a", "3": "#d98a64" }, sphere(({ dif }) => (dif > 0.8 ? "3" : dif > 0.42 ? "2" : "1")));
add("ball-gloss", "Esfera brillante (plástico o barniz): los mismos tonos que la mate más un punto de brillo pequeño y casi blanco. El brillo es la luz reflejada.", ["material"],
  { o: MAT_O, "1": "#8a4a3a", "2": "#b8664a", "3": "#d98a64", w: "#fff3e6" }, sphere(({ dif, spec }) => (spec > 0.93 ? "w" : dif > 0.8 ? "3" : dif > 0.42 ? "2" : "1")));
add("ball-metal", "Esfera de metal: contraste muy alto, saltos bruscos entre tonos y una banda oscura que refleja el horizonte. El metal enseña su entorno más que su color.", ["material"],
  { o: MAT_O, "1": "#2f3442", "2": "#5c6676", "3": "#a9b4c4", w: "#ffffff" }, sphere(({ dif, spec, ny }) => (spec > 0.85 ? "w" : ny > 0.15 && ny < 0.45 ? "1" : ny >= 0.45 ? "2" : dif > 0.45 ? "3" : "2")));
add("ball-glass", "Esfera de cristal: el centro deja ver el fondo oscuro, un brillo duro arriba y la luz que lo atraviesa se acumula ABAJO, en el lado contrario a la fuente.", ["material"],
  { o: MAT_O, "1": "#2a5a7a", "2": "#5aa8d8", "3": "#b8e8ff", w: "#ffffff" }, sphere(({ spec, nx, ny, nz }) => (spec > 0.9 ? "w" : nz < 0.6 && nx > -0.3 && ny > 0.3 ? "3" : nz < 0.5 ? "2" : "1")));

// ---------- de una rejilla de colores (hex) a sprite: reconstruye la paleta con letras
function hexGridToSprite(px) {
  const keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const pal = {}, byHex = {};
  const rows = px.map((r) => r.map((hex) => {
    if (hex === null) return ".";
    if (!byHex[hex]) { byHex[hex] = keys[Object.keys(pal).length]; pal[byHex[hex]] = hex; }
    return byHex[hex];
  }).join(""));
  return { pal, rows };
}
const stamp = (px, name, x0, y0) => {
  const s = spriteByName(name);
  s.rows.forEach((r, y) => [...r].forEach((k, x) => { if (k !== "." && px[y0 + y]?.[x0 + x] !== undefined) px[y0 + y][x0 + x] = s.palette[k]; }));
};

// ---------- orillas: hierba y agua en rejilla de tiles de 16×16
// La máscara dice qué tile es hierba (G) y cuál agua (W). En los tiles de agua que tocan hierba,
// cada píxel mira su distancia a la hierba: muy cerca → arena; algo más lejos → espuma; si no, agua.
// La distancia euclídea redondea sola las esquinas: así salen los tiles de borde, esquina y esquina interior.
const SHORE = { sand: "#e8d49a", sandD: "#c9b07a", foam: "#d8f0ff" };
function shoreMap(mask, { transitions = true } = {}) {
  const th = mask.length, tw = mask[0].length;
  const grassT = grassTile(), waterT = waterTile(0);
  const isG = (tx, ty) => mask[ty]?.[tx] === "G";
  const grassRects = [];
  mask.forEach((r, ty) => [...r].forEach((c, tx) => { if (c === "G") grassRects.push([tx * 16, ty * 16]); }));
  return Array.from({ length: th * 16 }, (_, y) => Array.from({ length: tw * 16 }, (_, x) => {
    const tx = Math.floor(x / 16), ty = Math.floor(y / 16);
    if (isG(tx, ty)) return GRASS[grassT.rows[y % 16][x % 16]];
    const water = WATER[waterT[y % 16][x % 16]];
    if (!transitions) return water;
    let d = Infinity;
    for (const [rx, ry] of grassRects) {
      const dx = Math.max(rx - (x + 0.5), 0, x + 0.5 - (rx + 16)), dy = Math.max(ry - (y + 0.5), 0, y + 0.5 - (ry + 16));
      d = Math.min(d, Math.hypot(dx, dy));
    }
    return d <= 2 ? SHORE.sand : d <= 3 ? SHORE.sandD : d <= 4 ? SHORE.foam : water;
  }));
}
const SHORE_MASK = ["GGGGG", "GGWWW", "GWWWW"];
{
  const hard = hexGridToSprite(shoreMap(SHORE_MASK, { transitions: false }));
  add("map-shore-hard", "Mapa de 80×48 (5×3 tiles) con hierba y agua sin transiciones: el tile de hierba toca directamente el de agua. El borde es una línea recta y escalonada que delata la rejilla.", ["tile", "mapa", "error"], hard.pal, hard.rows);
  const soft = shoreMap(SHORE_MASK);
  const m = hexGridToSprite(soft);
  add("map-shore", "El mismo mapa con tiles de transición: en el agua que toca la hierba hay 2 píxeles de arena clara, 1 de arena oscura y 1 de espuma. Las esquinas exteriores salen redondeadas.", ["tile", "mapa"], m.pal, m.rows);
  // los tres tiles de transición, recortados del mapa
  const cut = (tx, ty) => hexGridToSprite(soft.slice(ty * 16, ty * 16 + 16).map((r) => r.slice(tx * 16, tx * 16 + 16)));
  const edge = cut(3, 1), corner = cut(2, 1), inner = cut(2, 2);
  add("tile-shore-edge", "Tile de borde (16×16): agua con la hierba ARRIBA. La arena y la espuma recorren todo el borde superior; los otros tres bordes son agua normal.", ["tile", "transición"], edge.pal, edge.rows);
  add("tile-shore-corner", "Tile de esquina (16×16): agua con hierba arriba Y a la izquierda. La orilla dobla la esquina en ángulo recto: aquí la tierra entra en el agua.", ["tile", "transición"], corner.pal, corner.rows);
  add("tile-shore-inner", "Tile de esquina interior (16×16): agua con hierba solo en la DIAGONAL de arriba a la izquierda. Solo hay un cuarto de círculo de arena en esa esquina: es la punta de tierra vista desde el agua.", ["tile", "transición"], inner.pal, inner.rows);
}

// ---------- storytelling: el mismo reparto de personajes, sin historia y con historia
const CHEST_PAL = spriteByName("chest").palette;
add("chest-open", "El cofre abierto (12×12): la tapa echada hacia atrás enseña su cara interior oscura y el oro asoma por encima del borde. La cerradura queda en el frente.", ["prop", "historia"], CHEST_PAL, [
  ".oooooooooo.",
  "oWWWWWWWWWWo",
  "oWWWWWWWWWWo",
  "ooyyyoyyyyoo",
  "oyyyyyyyYyyo",
  "oYyyYyyyyyYo",
  "oooooooooooo",
  "olllllllllwo",
  "owwwoyyowwWo",
  "owwwoYYowwWo",
  "oWWWWWWWWWWo",
  "oooooooooooo",
]);
add("slime-puddle", "Un slime derrotado (12×4): un charco aplanado, sin ojos ni brillo. Sin texto, cuenta que aquí hubo una pelea.", ["criatura", "historia"],
  { o: "#1b1030", g: "#4ade80", G: "#1f8a4c" }, [
  "...oooooo...",
  ".oogggggGoo.",
  "oGGGGGGGGGGo",
  ".oooooooooo.",
]);
{
  const sw = spriteByName("sword");
  const H = sw.rows.length, W = sw.rows[0].length;
  // girada 90° en sentido horario: la punta mira a la derecha, como tirada en el suelo
  const rows = Array.from({ length: W }, (_, y) => Array.from({ length: H }, (_, x) => sw.rows[H - 1 - x][y]).join(""));
  add("sword-ground", "La espada del curso girada 90° (15×7): tumbada en el suelo, con la punta a la derecha. Un objeto en una posición que no es la suya ya cuenta algo.", ["arma", "historia"], sw.palette, rows);
}
function storyScene(placements, ground = GRASS) {
  const t = grassTile();
  const px = Array.from({ length: 40 }, (_, y) => Array.from({ length: 64 }, (_, x) => ground[t.rows[y % 16][x % 16]]));
  for (const [n, x, y] of placements) stamp(px, n, x, y);
  return hexGridToSprite(px);
}
{
  const DARK = { g: "#24563a", d: "#1a4030", l: "#3a7a50" };
  const none = storyScene([["slime", 6, 20], ["hero-chibi", 24, 10], ["chest", 48, 22]], DARK);
  add("scene-story-none", "Escena de 64×40 sin historia: slime, héroe y cofre en fila, a la misma distancia y mirando al frente. Es un catálogo de personajes: no ha pasado nada.", ["escena", "historia", "error"], none.pal, none.rows);
  const story = storyScene([["slime-puddle", 4, 30], ["sword-ground", 18, 28], ["hero-chibi", 32, 10], ["chest-open", 50, 20]], DARK);
  add("scene-story", "Los mismos personajes contando algo: un charco de slime y la espada tirada a la izquierda (la pelea, ya pasada) y el héroe junto al cofre ya abierto. Se lee de izquierda a derecha: lucha, victoria, tesoro.", ["escena", "historia"], story.pal, story.rows);
}

// ---------- escena final (P8-01): mapa con orillas, personajes, efecto y props, todo con las reglas del curso
{
  const px = shoreMap(SHORE_MASK);
  for (const [n, x, y] of [["rock-clean", 3, 37], ["mushroom8", 68, 5], ["hero-chibi", 6, 6], ["vfx-hit-2", 25, 4], ["slime", 43, 6], ["chest", 58, 4]]) stamp(px, n, x, y);
  const s = hexGridToSprite(px);
  add("scene-final", "Escena de 80×48 con todo lo del curso: tiles de hierba y agua con orilla, el héroe frente al slime, el impacto entre los dos, un cofre al fondo y una roca y una seta en los bordes. El foco está en el impacto: el píxel más claro de la escena.", ["escena", "ilustración"], s.pal, s.rows);
}

// ---------- spritesheet del ciclo de caminar (para importarlo en Godot): 4 frames de 16×24 en fila
{
  const frames = ["hero-chibi", "hero-walk-a", "hero-chibi", "hero-walk-b"].map((n) => spriteByName(n).rows);
  add("hero-walk-sheet", "Spritesheet de 64×24: los 4 frames del ciclo de caminar en una fila (base, paso A, base, paso B), cada uno de 16×24. Es el formato que espera un motor: una imagen, una rejilla.", ["personaje", "animación", "spritesheet"], HERO,
    Array.from({ length: 24 }, (_, y) => frames.map((f) => f[y]).join("")));
}

// ---------- interfaz: un panel 9-slice de 24×24 (esquinas de 8×8) y una barra de vida
// El panel base se dibuja con reglas; las versiones anchas se construyen como lo haría un motor:
// 9-slice (esquinas intactas, bordes y centro repetidos) frente a estirar la imagen entera.
const UI = { o: "#1b1030", L: "#c9d1dc", M: "#8f9bab", D: "#5c6676", f: "#2a2d3a", F: "#33364a", y: "#f2c14e" };
function panelBase() {
  const S = 24;
  return Array.from({ length: S }, (_, y) => Array.from({ length: S }, (_, x) => {
    const r = Math.min(x, y, S - 1 - x, S - 1 - y); // anillo: 0 fuera … 4+ dentro
    if (r === 0) return (x === 0 || x === S - 1) && (y === 0 || y === S - 1) ? "." : "o"; // esquinas redondeadas
    if (r === 1) return x === S - 1 - 1 || y === S - 1 - 1 ? "D" : "L"; // bisel: luz arriba-izquierda
    if (r === 2) return "M";
    if (r === 3) return "o";
    return (x + y) % 4 === 0 ? "F" : "f"; // trama suave del fondo, de periodo 4: se repite sin costuras
  }).join(""));
}
const panel = panelBase().map((r) => [...r]);
for (const [x, y] of [[4, 4], [19, 4], [4, 19], [19, 19]]) panel[y][x] = "y"; // remaches en las esquinas
const panelRows = panel.map((r) => r.join(""));
add("ui-panel", "Panel de interfaz de 24×24 pensado para 9-slice: esquinas de 8×8 con un remache dorado, bordes con bisel (claro arriba y a la izquierda, oscuro abajo y a la derecha) y un centro con una trama de periodo 4.", ["ui"], UI, panelRows);
function nineSlice(rows, W, H, c = 8) {
  const S = rows.length;
  const map = (v, len) => (v < c ? v : v >= len - c ? S - (len - v) : c + ((v - c) % (S - 2 * c)));
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => rows[map(y, H)][map(x, W)]).join(""));
}
add("ui-panel-wide", "El mismo panel ampliado a 64×24 con 9-slice: las cuatro esquinas se copian tal cual, los bordes y el centro se REPITEN. El bisel sigue midiendo 1 píxel y los remaches siguen siendo cuadrados.", ["ui"], UI, nineSlice(panelRows, 64, 24));
add("ui-panel-stretched", "Error: el panel estirado a 64×24 como una imagen (×2,67 en horizontal, vecino más cercano). Los bordes verticales miden 2 o 3 píxeles según la columna, el bisel se ensancha y los remaches se alargan.", ["ui", "error"], UI,
  panelRows.map((r) => Array.from({ length: 64 }, (_, x) => r[Math.floor((x * 24) / 64)]).join("")));
function healthBar(fill) {
  const W = 32, H = 7, inner = W - 4, n = Math.round(inner * fill);
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    if (y === 0 || y === H - 1) return x === 0 || x === W - 1 ? "." : "o";
    if (x === 0 || x === W - 1) return "o";
    if (x === 1 || x === W - 2) return "M";
    const i = x - 2;
    if (i >= n) return y === 1 ? "D" : "k"; // vacío: un hueco oscuro
    return y === 1 ? "p" : y === H - 2 ? "R" : "r"; // lleno: brillo arriba, sombra abajo
  }).join(""));
}
const BAR = { o: UI.o, M: UI.M, D: UI.D, k: "#14121c", p: "#ff9a9a", r: "#e8484f", R: "#9c2234" };
{ const rows = healthBar(1); add("ui-bar-full", "Barra de vida de 32×7 llena: contorno, marco gris de 1 píxel y el rojo con una fila de brillo arriba y otra de sombra abajo, como un tubo.", ["ui"], Object.fromEntries(Object.entries(BAR).filter(([k]) => rows.some((r) => r.includes(k)))), rows); }
add("ui-bar-low", "La misma barra al 25 %: 7 píxeles de rojo y el resto un hueco oscuro con su propio borde superior. La forma del marco no cambia: solo cambia lo que hay dentro.", ["ui"], BAR, healthBar(0.25));

// ---------- palette swap: el mismo slime, otras paletas. Las letras no cambian: solo los colores
const SLIME_BASE = spriteByName("slime");
const swap = (name, d, colors, tags = ["criatura", "paleta"]) => add(name, d, tags, { ...SLIME_BASE.palette, ...colors }, SLIME_BASE.rows);
swap("slime-red", "Slime de fuego: los mismos píxeles que el verde con otra rampa (rojo, granate y un brillo rosado). Mismo valor relativo entre tonos: se lee igual de redondo.", { g: "#e8484f", G: "#9c2234", h: "#ffd0d0" });
swap("slime-blue", "Slime de agua: la rampa en azules. Base media, sombra oscura y brillo casi blanco, con la misma separación de valor que el original.", { g: "#4aa8ff", G: "#1f4f9a", h: "#d8f0ff" });
swap("slime-gold", "Slime dorado (el raro): oro, ocre y un brillo crema. Más claro que el rojo y el azul (y casi del mismo valor que el verde): junto a ellos destaca, que es lo que debe hacer el enemigo especial.", { g: "#f2c14e", G: "#a8661c", h: "#fff3c4" });
swap("slime-swap-flat", "Error: un swap a azul donde la sombra tiene casi el mismo valor que la base. En color aún se distingue; en grises, el slime es una mancha plana y pierde el volumen.", { g: "#4aa8ff", G: "#3f9ae8", h: "#d8f0ff" }, ["criatura", "paleta", "error"]);

// ---------- luz de escena: la escena final de día, al atardecer y de noche (remapeo de su paleta)
// tintado en RGB según el valor (luminancia): girar el tono en HSL lleva la piel al violeta por el camino corto del círculo
const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const hexOf = (c) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
const lumOf = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function relight(name, newName, d, fn, tags) {
  const s = spriteByName(name);
  // los colores pueden fundirse en uno: se reconstruye la paleta para que no haya letras repetidas
  const px = s.rows.map((r) => [...r].map((k) => (k === "." ? null : fn(s.palette[k]))));
  const t = hexGridToSprite(px);
  add(newName, d, tags, t.pal, t.rows);
}
relight("scene-final", "scene-final-dusk", "La escena final al atardecer: todos los colores giran un poco hacia el naranja y bajan algo de valor; las sombras, hacia el violeta. Sigue leyéndose porque el contraste entre valores se mantiene.", (hex) => {
  const c = rgbOf(hex), y = lumOf(c);
  return hexOf(c.map((v, i) => v * mix([0.78, 0.64, 0.86], [1.06, 0.86, 0.66], Math.min(1, y * 1.3))[i])); // luces cálidas, sombras violáceas
}, ["escena", "luz"]);
relight("scene-final", "scene-final-night", "La escena final de noche: todo gira hacia el azul, pierde saturación y baja de valor, pero el orden de valores se mantiene (el impacto sigue siendo lo más claro). El impacto conserva su color: es la fuente de luz.", (hex) => {
  if (["#ffffff", "#ffe58a", "#ff8f3a"].includes(hex)) return hex; // la fuente de luz no se oscurece
  const c = rgbOf(hex), y = lumOf(c) * 255;
  return hexOf(mix(c, [y, y, y], 0.6).map((v, i) => 10 + v * [0.42, 0.55, 0.85][i])); // menos saturación, tinte azul, menos valor

}, ["escena", "luz"]);
relight("scene-final", "scene-final-dark", "Error: la «noche» hecha solo bajando el brillo de todo (×0,4). Los colores no cambian de temperatura, el impacto se apaga con el resto y la escena parece una foto subexpuesta, no una noche.", (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * 0.4).toString(16).padStart(2, "0")).join("");
}, ["escena", "luz", "error"]);

// ---------- tipografía: una fuente de 3×5 dibujada a mano (# = trazo)
const GLYPHS = {
  A: [".#.", "#.#", "###", "#.#", "#.#"], B: ["##.", "#.#", "##.", "#.#", "##."], C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."], E: ["###", "#..", "##.", "#..", "###"], F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"], H: ["#.#", "#.#", "###", "#.#", "#.#"], I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."], K: ["#.#", "#.#", "##.", "#.#", "#.#"], L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"], N: ["##.", "#.#", "#.#", "#.#", "#.#"], O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."], Q: [".#.", "#.#", "#.#", "##.", ".##"], R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."], T: ["###", ".#.", ".#.", ".#.", ".#."], U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."], W: ["#.#", "#.#", "###", "###", "#.#"], X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."], Z: ["###", "..#", ".#.", "#..", "###"],
  0: ["###", "#.#", "#.#", "#.#", "###"], 1: [".#.", "##.", ".#.", ".#.", "###"], 2: ["##.", "..#", ".#.", "#..", "###"],
  3: ["##.", "..#", ".#.", "..#", "##."], 4: ["#.#", "#.#", "###", "..#", "..#"], 5: ["###", "#..", "##.", "..#", "##."],
  6: [".##", "#..", "###", "#.#", "###"], 7: ["###", "..#", ".#.", ".#.", ".#."], 8: ["###", "#.#", "###", "#.#", "###"],
  9: ["###", "#.#", "###", "..#", "##."], " ": ["...", "...", "...", "...", "..."],
};
// escribe un texto: cada letra mide 3 de ancho y va separada por `gaps[i]` píxeles (1 por defecto)
function typeset(text, { gaps = [], shadow = false, ink = "w", shade = "d" } = {}) {
  const chars = [...text];
  const W = chars.reduce((a, _, i) => a + 3 + (i < chars.length - 1 ? gaps[i] ?? 1 : 0), 0) + (shadow ? 1 : 0), H = 5 + (shadow ? 1 : 0);
  const g = Array.from({ length: H }, () => Array(W).fill("."));
  let x0 = 0;
  chars.forEach((ch, i) => {
    GLYPHS[ch].forEach((r, y) => [...r].forEach((p, x) => {
      if (p !== "#") return;
      if (shadow && g[y + 1][x0 + x + 1] === ".") g[y + 1][x0 + x + 1] = shade;
      g[y][x0 + x] = ink;
    }));
    x0 += 3 + (gaps[i] ?? 1);
  });
  return g.map((r) => r.join(""));
}
const TXT = { w: "#fff3c4", d: "#5b4a7a" };
{
  const lines = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "0123456789"].map((t) => typeset(t));
  const W = Math.max(...lines.map((l) => l[0].length));
  const rows = lines.flatMap((l, i) => [...l.map((r) => r.padEnd(W, ".")), ...(i < lines.length - 1 ? [".".repeat(W)] : [])]);
  add("font-3x5", "Fuente de 3×5 dibujada a mano: las 26 letras y los 10 números, cada uno en 3 de ancho y 5 de alto, separados por 1 píxel. Todas comparten la misma altura, el mismo grosor (1 píxel) y la misma separación.", ["tipografía"], { w: TXT.w }, rows);
}
add("text-forja", "«FORJA ART» con la fuente de 3×5 y una sombra de 1 píxel abajo a la derecha, en un violeta oscuro. La sombra separa el texto de cualquier fondo sin engordar las letras.", ["tipografía"], TXT, typeset("FORJA ART", { shadow: true }));
add("text-spacing-bad", "Error: el mismo texto con el espaciado a ojo (0, 2, 1, 0, 3, 1, 0, 2 píxeles). Las letras se pegan o se separan al azar y la palabra se rompe en trozos.", ["tipografía", "error"], TXT, typeset("FORJA ART", { shadow: true, gaps: [0, 2, 1, 0, 3, 1, 0, 2] }));

// ---------- smears: el tajo de una espada en 3 frames (24×24). Un arco grueso que «arrastra» el movimiento
const SLASH = { w: "#ffffff", c: "#bfe9ff", b: "#6fb8ff", B: "#2a6fc9" };
function slashFrame(a0, a1, rIn, colors) {
  const deg = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI;
  return Array.from({ length: 24 }, (_, y) => Array.from({ length: 24 }, (_, x) => {
    const dx = x + 0.5 - 12, dy = y + 0.5 - 12, d = Math.hypot(dx, dy), a = deg(dx, dy);
    if (d > 11 || a < a0 || a > a1) return ".";
    const t = (a - a0) / (a1 - a0); // 0 = cola, 1 = punta (por donde va la espada)
    const inner = rIn + (11 - rIn) * (1 - Math.sin(Math.PI * Math.min(1, t * 1.1))) * 0.9; // más grueso en el centro del arco
    if (d < inner) return ".";
    const k = (d - inner) / (11 - inner); // 0 borde interior → 1 borde exterior
    return colors(k, t);
  }).join(""));
}
const usedOnly = (pal, rows) => Object.fromEntries(Object.entries(pal).filter(([k]) => rows.some((r) => r.includes(k))));
const slashes = [
  slashFrame(-80, -20, 8.5, (k) => (k > 0.6 ? "w" : "c")),
  slashFrame(-80, 150, 5, (k, t) => (k > 0.75 ? "w" : k > 0.4 ? "c" : t < 0.35 ? "B" : "b")),
  slashFrame(70, 150, 9, (k) => (k > 0.5 ? "b" : "B")),
];
const SLASH_D = [
  "Tajo, frame 1: el arranque. Un trozo corto de arco arriba a la derecha, blanco por fuera: la espada acaba de empezar a moverse.",
  "Tajo, frame 2: el smear completo. Un arco grueso desde arriba a la derecha hasta abajo a la izquierda: dibuja en UN frame todo el recorrido de la espada. Blanco en el borde exterior, azul claro en medio y más oscuro hacia la cola.",
  "Tajo, frame 3: la estela. Solo queda la cola del arco abajo a la izquierda, fina y en azules oscuros: el movimiento se apaga.",
];
slashes.forEach((rows, i) => add(`slash-${i + 1}`, SLASH_D[i], ["vfx", "animación", "smear"], usedOnly(SLASH, rows), rows));
{
  // error: el mismo recorrido como una línea de 1 píxel (sin arrastre): se lee como un dibujo, no como un golpe
  const rows = Array.from({ length: 24 }, (_, y) => Array.from({ length: 24 }, (_, x) => {
    const dx = x + 0.5 - 12, dy = y + 0.5 - 12, d = Math.hypot(dx, dy), a = (Math.atan2(dy, dx) * 180) / Math.PI;
    return Math.abs(d - 10) < 0.5 && a >= -80 && a <= 150 ? "c" : ".";
  }).join(""));
  add("slash-thin", "Error: el mismo recorrido como una línea fina de 1 píxel. Tiene la forma del arco, pero no el peso: a la velocidad del juego desaparece y no se siente el golpe.", ["vfx", "animación", "error"], { c: SLASH.c }, rows);
}


// ---------- retrato de 32×32: el héroe de busto. Formas con reglas (elipses), luz desde arriba a la izquierda
const PORT = {
  o: "#1b1030", l: "#ffdcbc", s: "#f2c29b", S: "#c98f6b", d: "#9c6450",
  H: "#a0603a", h: "#6b3d2e", k: "#4a2820", w: "#fff3ec", i: "#3b6fd1", m: "#a8484f",
  t: "#3b6fd1", T: "#26489a", u: "#5a8ae8", b: "#6b3d2e",
};
function portrait(mode) {
  // mode: "masses" (colores planos, sin rasgos) · "final" · "pillow" (error: sombra alrededor del centro)
  const N = 32, cx = 15.5;
  const L = (() => { const v = [-0.45, -0.5, 0.74]; const n = Math.hypot(...v); return v.map((a) => a / n); })();
  const lvl = (nx, ny, ramp) => {
    if (mode === "masses") return ramp[1];
    const r2 = nx * nx + ny * ny, nz = Math.sqrt(Math.max(0, 1 - r2));
    const k = mode === "pillow" ? 1 - Math.sqrt(r2) : nx * L[0] + ny * L[1] + nz * L[2];
    const cuts = mode === "pillow" ? [0.62, 0.32, 0.12] : [0.9, 0.62, 0.3];
    return k > cuts[0] ? ramp[0] : k > cuts[1] ? ramp[1] : k > cuts[2] ? ramp[2] : ramp[3] ?? ramp[2];
  };
  const head = (x, y) => {
    const cy = 14.5, ry = 10.5;
    const t = Math.max(0, (y - cy) / ry), rx = 9.2 * (1 - 0.4 * t * t);
    const nx = (x - cx) / rx, ny = (y - cy) / ry;
    return nx * nx + ny * ny <= 1 ? [nx, ny] : null;
  };
  const hairVol = (x, y) => { const nx = (x - cx) / 10.4, ny = (y - 10.5) / 8.2; return nx * nx + ny * ny <= 1 && y <= 17 ? [nx, ny] : null; };
  // flequillo asimétrico: la raya está a la derecha del espectador y el pelo cae hacia la izquierda
  const FRINGE = [13, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9, 10, 11, 11, 12, 13]; // de x = 8 a x = 23
  const hairline = (x) => (x < 8 || x > 23 ? 18 : FRINGE[x - 8]);
  const ear = (x, y) => [[6, 16.5], [25, 16.5]].some(([ex, ey]) => ((x - ex) / 1.5) ** 2 + ((y - ey) / 2.2) ** 2 <= 1);
  const body = (x, y) => { const nx = (x - cx) / 15, ny = (y - 38) / 11; return y >= 27 && nx * nx + ny * ny <= 1 ? [nx, ny] : null; };
  // se calcula con 2 filas de más abajo y luego se recortan las 2 de arriba: así caben los hombros
  const g = Array.from({ length: N + 2 }, (_, y) => Array.from({ length: N }, (_, x) => {
    const X = x + 0.5, Y = y + 0.5;
    const hd = head(X, Y), hv = hairVol(X, Y);
    if (hv && (!hd || Y < hairline(x) || x <= 7 || x >= 24)) return lvl(hv[0], hv[1], ["H", "h", "k", "k"]);
    if (hd) {
      if (mode !== "masses" && Y < hairline(x) + 1.2 && x > 7 && x < 24) return mode === "pillow" ? lvl(hd[0], hd[1], ["l", "s", "S", "d"]) : "S"; // sombra que el flequillo arroja
      // la cara es casi un plano frontal: se aplana la curvatura vertical para que no se oscurezca toda la mitad de abajo
      return mode === "pillow" ? lvl(hd[0], hd[1], ["l", "s", "S", "d"]) : lvl(hd[0], (hd[1] - 0.15) * 0.55, ["l", "s", "S", "d"]);
    }
    if (ear(X, Y)) return mode === "masses" ? "s" : X < cx ? "s" : "S";
    if (X >= 12 && X <= 20 && Y >= 23 && Y < 30) return mode === "masses" ? "s" : Y < 27 ? "d" : "S"; // cuello: en sombra bajo la barbilla
    const bd = body(X, Y);
    if (bd) return lvl(bd[0], bd[1], ["u", "t", "T", "T"]);
    return ".";
  }));
  // cuello de la túnica en V
  for (let y = 28; y < 32; y++) for (let x = 0; x < N; x++) {
    const dx = Math.abs(x + 0.5 - cx);
    if (g[y][x] !== "." && dx >= 4.5 - (y - 28) && dx < 6.5 - (y - 28) * 0.6 && !"sSdl".includes(g[y][x])) g[y][x] = "b";
  }
  if (mode !== "masses") {
    const set = (x, y, c) => { g[y][x] = c; };
    // ojos: párpado de 3 px, blanco a un lado y el iris mirando al frente
    [[10, 11, 12], [19, 20, 21]].forEach((xs, side) => {
      xs.forEach((x) => set(x, 15, "o"));
      const [a, b, c] = side === 0 ? ["w", "i", "o"] : ["o", "i", "w"];
      set(xs[0], 16, a); set(xs[1], 16, b); set(xs[2], 16, c);
      set(xs[0], 17, a === "w" ? "w" : "i"); set(xs[1], 17, "i"); set(xs[2], 17, c === "w" ? "w" : "i");
    });
    // cejas: 3 px, la del lado de la raya un poco más alta (gesto decidido)
    [10, 11, 12].forEach((x) => set(x, 13, "k"));
    [19, 20, 21].forEach((x) => set(x, 12, "k"));
    // nariz: solo su sombra a la derecha y un brillo en la punta
    set(17, 18, "S"); set(17, 19, "S"); set(16, 20, "d"); set(17, 20, "d"); set(15, 19, "l");
    // boca: 4 px con la comisura un poco levantada
    [14, 15, 16, 17].forEach((x) => set(x, 22, "m")); set(18, 21, "S");
  }
  // contorno: todo píxel de la figura que toca el vacío (salvo el borde inferior del lienzo: el busto sigue)
  const fig = (x, y) => y >= g.length || (g[y]?.[x] ?? ".") !== ".";
  const outlined = g.map((r, y) => r.map((c, x) => (c !== "." && (!fig(x - 1, y) || !fig(x + 1, y) || !fig(x, y - 1) || !fig(x, y + 1)) ? "o" : c)));
  return outlined.slice(2).map((r) => r.join(""));
}
{
  const masses = portrait("masses"), fin = portrait("final"), pillow = portrait("pillow");
  add("portrait-masses", "Retrato de 32×32, paso 1: las masas en colores planos. Pelo, cara, orejas, cuello y túnica, cada uno de un color y con su contorno. Sin luz ni rasgos: aquí solo se decide la silueta y las proporciones.", ["personaje", "retrato"], usedOnly(PORT, masses), masses);
  add("portrait", "Retrato terminado (32×32): la luz llega de arriba a la izquierda, así que la mejilla izquierda es la más clara y la sombra se acumula a la derecha y bajo la barbilla. El flequillo arroja una franja de sombra sobre la frente. Ojos de 3×3 con párpado, iris y blanco; la nariz es solo una sombra y un brillo.", ["personaje", "retrato"], usedOnly(PORT, fin), fin);
  add("portrait-pillow", "Error: el mismo retrato con pillow shading. Cada masa es clara en el centro y se oscurece igual por todos los lados. No hay una luz: la cara parece un cojín inflado y el pelo, un casco.", ["personaje", "retrato", "error"], usedOnly(PORT, pillow), pillow);
}

// ---------- recibir daño: flash blanco, retroceso y parpadeo de invulnerabilidad (lienzo de 18×12)
{
  const sl = spriteByName("slime");
  const HURT = { ...sl.palette, W: "#ffffff", k: "#14301f" };
  const frame = (x0, { flash = false, body = true } = {}) => {
    const g = Array.from({ length: 12 }, () => Array(18).fill("."));
    for (let x = x0 + 1; x < x0 + 9; x++) g[10][x] = "k"; // sombra en el suelo: no parpadea
    for (let x = x0 + 2; x < x0 + 8; x++) g[11][x] = "k";
    if (body) sl.rows.forEach((r, y) => [...r].forEach((k, x) => { if (k !== ".") g[y + 2][x0 + x] = flash ? (k === "o" ? "o" : "W") : k; }));
    return g.map((r) => r.join(""));
  };
  const F = [
    ["slime-hurt-1", "Daño, frame 1: el slime en su sitio, justo antes de recibir el golpe. Debajo, su sombra en el suelo.", frame(2)],
    ["slime-hurt-2", "Daño, frame 2: el flash. En el mismo sitio, todo el relleno pasa a blanco y solo queda el contorno. Dura muy poco: es el «ha dado».", frame(2, { flash: true })],
    ["slime-hurt-3", "Daño, frame 3: el retroceso. El slime aparece 4 píxeles a la derecha, lejos del golpe, con sus colores normales.", frame(6)],
    ["slime-hurt-4", "Daño, frame 4: vuelve 1 píxel hacia atrás y se asienta. Ahí se queda.", frame(5)],
    ["slime-hurt-5", "Daño, frame 5: el parpadeo de invulnerabilidad. El slime desaparece pero su sombra se queda: alternado con el frame 4, dice «ahora no se le puede dañar».", frame(5, { body: false })],
  ];
  F.forEach(([n, d, rows]) => add(n, d, ["criatura", "animación", "daño"], usedOnly(HURT, rows), rows));
  const hero = spriteByName("hero-chibi");
  const flashRows = hero.rows.map((r) => r.replace(/[^.o]/g, "W"));
  add("hero-flash", "El héroe con el flash de daño: el contorno se queda y todo el relleno pasa a blanco. Es el mismo sprite con otra paleta, no un dibujo nuevo.", ["personaje", "daño"], { o: hero.palette.o, W: "#ffffff" }, flashRows);
  add("hero-flash-red", "Error: el flash en un rojo oscuro. Sobre la túnica azul y el pelo castaño apenas cambia el valor: a la velocidad del juego no se nota el golpe.", ["personaje", "daño", "error"], { o: hero.palette.o, W: "#8a2a3a" }, flashRows);
}

// ---------- parallax: tres capas que se repiten cada 64 px y se mueven a velocidades distintas (64×40)
// Paleta fija (las mismas letras en todos los frames, para que el animador pueda mezclarlos)
const PAR = {
  a: "#bfe3f2", b: "#d8eef2", // cielo: arriba algo más saturado, abajo casi blanco
  m: "#9cc0d6", M: "#86aac4", // montañas lejanas: poco contraste, casi del color del cielo
  c: "#5f9a8a", C: "#4b8070", // colinas: algo más oscuras y verdes
  n: "#2c5a3a", N: "#1c3f2a", y: "#3f7a4a", // primer plano: oscuro, saturado y con contraste
};
const PER = 64, PER_FAR = 32; // las montañas se repiten cada 32 px, colinas y árboles cada 64
const wave = (x, per, parts) => parts.reduce((a, [amp, k, ph]) => a + amp * Math.sin((2 * Math.PI * k * x) / per + ph), 0);
const mountainTop = (x) => 17 + wave(x, PER_FAR, [[3.5, 1, 0.3], [1.6, 2, 1.7], [0.8, 3, 0.4]]);
const hillTop = (x) => 23 + wave(x, PER, [[2.5, 1, 2.1], [1.4, 3, 0.2]]);
const treeTop = (x) => {
  // copas redondas: semicírculos de radios distintos, repetidos cada 64 px
  const T = [[4, 5], [13, 4], [21, 6], [33, 4], [41, 5], [52, 4], [59, 5]];
  let top = 33; // suelo del bosque: entre copa y copa no se ve el fondo
  for (const [tx, r] of T) for (const dx of [-PER, 0, PER]) {
    const d = x + 0.5 - (tx + dx);
    if (Math.abs(d) <= r) top = Math.min(top, Math.round(32 - Math.sqrt(r * r - d * d)));
  }
  return top;
};
const wrap = (v, p) => ((v % p) + p) % p;
function parallaxFrame(offFar, offMid, offNear, { flat = false, layers = 3 } = {}) {
  return Array.from({ length: 40 }, (_, y) => Array.from({ length: 64 }, (_, x) => {
    const xn = wrap(x + offNear, PER), xm = wrap(x + offMid, PER), xf = wrap(x + offFar, PER_FAR);
    if (layers >= 3 && y >= treeTop(xn)) {
      if (flat) return "N";
      const t = treeTop(xn);
      return y >= 37 || y >= t + 4 ? "N" : y === t && wrap(xn, 3) === 0 ? "y" : "n";
    }
    if (layers >= 2 && y >= hillTop(xm)) return flat ? "N" : y < hillTop(xm) + 1 ? "c" : "C";
    if (y >= mountainTop(xf)) return flat ? "N" : y < mountainTop(xf) + 1 ? "m" : "M";
    return y < 12 ? "a" : "b";
  }).join(""));
}
{
  const FR = 16;
  for (let f = 0; f < FR; f++) add(`parallax-${f + 1}`, `Parallax, frame ${f + 1} de ${FR}: la cámara avanza a la derecha. Desde el frame 1, las montañas se han movido ${f * 2} px, las colinas ${f * 4} y los árboles ${f * 8}: lo que está más lejos se mueve menos.`, ["fondo", "parallax", "animación"], PAR, parallaxFrame(f * 2, f * 4, f * 8));
  const far = parallaxFrame(0, 0, 0, { layers: 1 });
  add("parallax-far", "Solo la capa de las montañas lejanas sobre el cielo: dos azules grisáceos muy cerca del color del cielo. Casi no hay contraste: así se ve lo que está lejos.", ["fondo", "parallax"], usedOnly(PAR, far), far);
  const flat = parallaxFrame(0, 0, 0, { flat: true });
  add("parallax-flat", "Error: montañas, colinas y árboles en el mismo verde oscuro, sin contraste entre ellos. Se funden en una sola silueta: no se sabe qué está cerca y qué lejos.", ["fondo", "parallax", "error"], usedOnly(PAR, flat), flat);
}


// ---------- moneda que gira: 6 frames de 16×16. La cara se estrecha, aparece el canto y la luz NO gira
const COIN = { o: "#5a3a10", y: "#f2c14e", L: "#ffe58a", Y: "#c98a2a", c: "#a8661c", w: "#ffffff" };
function coinFrame(hw, { back = false } = {}) {
  const cx = 8, cy = 8, ry = 6.5;
  const g = Array.from({ length: 16 }, () => Array(16).fill("."));
  if (hw < 1.5) {
    // de canto: una franja de 2 px, con el contorno arriba y abajo
    for (let y = 1; y < 15; y++) for (const x of [7, 8]) g[y][x] = y === 1 || y === 14 ? "o" : x === 7 ? "Y" : "c";
    for (const x of [6, 9]) for (let y = 2; y < 14; y++) g[y][x] = "o";
    return g.map((r) => r.join(""));
  }
  const inside = (x, y, rx) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
  // el canto asoma por el lado hacia el que gira la moneda (1 px más allá de la cara)
  const edgeSide = hw < 5.5 ? (back ? -1 : 1) : 0;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (inside(x, y, hw)) {
      const d = Math.hypot((x + 0.5 - cx) / hw, (y + 0.5 - cy) / ry), s = (x + 0.5 - cx) / hw + (y + 0.5 - cy) / ry;
      g[y][x] = d > 0.74 ? (s < 0 ? "L" : "Y") : "y"; // bisel: claro arriba-izquierda, oscuro abajo-derecha, en pantalla
    } else if (edgeSide && inside(x - edgeSide, y, hw)) g[y][x] = "c";
  }
  if (!back && hw >= 4) for (let y = 5; y <= 10; y++) for (let x = 0; x < 16; x++) if (Math.abs(x + 0.5 - cx) <= (hw >= 5.5 ? 1 : 0.5) && g[y][x] === "y") g[y][x] = "Y"; // emblema: una barra en relieve
  if (hw >= 4) { const hx = Math.round(cx - hw * 0.45); g[4][hx] = "w"; } // brillo fijo arriba a la izquierda
  // contorno alrededor de todo
  const out = g.map((r, y) => r.map((c, x) => (c === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (g[y + dy]?.[x + dx] ?? ".") !== ".") ? "o" : c)));
  return out.map((r) => r.join(""));
}
{
  const F = [[6], [4.5], [2.5], [1], [2.5, true], [4.5, true]];
  const D = [
    "Moneda, frame 1: de frente. Cara completa de 12 px de ancho con el bisel (claro arriba a la izquierda, oscuro abajo a la derecha), la barra del emblema y un brillo blanco.",
    "Moneda, frame 2: girando. La cara mide 8 px y por la derecha asoma 1 px del canto, más oscuro. El bisel y el brillo siguen en el mismo sitio: la luz no gira con la moneda.",
    "Moneda, frame 3: casi de perfil. La cara mide 4 px y el canto sigue asomando a la derecha. Ya no caben ni el emblema ni el brillo.",
    "Moneda, frame 4: de canto. Solo se ve el grosor: una franja de 2 px. Sin este frame, la moneda parece encogerse y volver a crecer, no girar.",
    "Moneda, frame 5: el reverso, casi de perfil. Ahora el canto asoma a la izquierda y la cara no tiene emblema: es la otra cara.",
    "Moneda, frame 6: el reverso girando hacia el frente. 8 px de cara, canto a la izquierda. Después vuelve el frame 1.",
  ];
  F.forEach(([hw, back], i) => { const rows = coinFrame(hw, { back }); add(`coin-${i + 1}`, D[i], ["prop", "animación", "moneda"], usedOnly(COIN, rows), rows); });
  // error: el frame 3 hecho estrechando el frame 1 como una imagen (vecino más cercano)
  const full = coinFrame(6);
  const sq = Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    const sx = Math.floor(8 + (x + 0.5 - 8) / (2.5 / 6));
    return sx >= 0 && sx < 16 ? full[y][sx] : ".";
  }).join(""));
  add("coin-squeezed", "Error: el frame 3 hecho estrechando el frame 1 con la herramienta de escalar (vecino más cercano). Al contorno le faltan píxeles en casi todas las filas, el emblema y el brillo desaparecen y no hay canto: parece una moneda aplastada, no una que gira.", ["prop", "animación", "moneda", "error"], usedOnly(COIN, sq), sq);
}

// ---------- plataformas en vista lateral: un tileset de 3×3 (esquinas, bordes y centro) de tierra con hierba
const PLAT = { o: "#2a1a12", L: "#6fd17f", g: "#3fa45b", G: "#2c7a48", d: "#8a5a3c", D: "#6b4430", s: "#a8744a" };
const GRASS_DROP = [3, 4, 3, 3, 4, 5, 4, 3]; // dónde acaba la hierba en cada columna: periodo 8, encaja en 16
function platformMap(mask, { flat = false } = {}) {
  const th = mask.length, tw = mask[0].length;
  const solid = (tx, ty) => mask[ty]?.[tx] === "#";
  return Array.from({ length: th * 16 }, (_, y) => Array.from({ length: tw * 16 }, (_, x) => {
    const tx = Math.floor(x / 16), ty = Math.floor(y / 16), lx = x % 16, ly = y % 16;
    if (!solid(tx, ty)) return null;
    const dirt = (lx * 5 + ly * 3) % 11 === 0 ? "D" : (lx * 3 + ly * 7) % 13 === 0 ? "s" : "d"; // textura con periodo 16: sin costuras
    if (flat) return PLAT[dirt];
    const up = solid(tx, ty - 1), dn = solid(tx, ty + 1), lf = solid(tx - 1, ty), rt = solid(tx + 1, ty);
    if ((!up && !lf && lx + ly <= 1) || (!up && !rt && 15 - lx + ly <= 1) || (!dn && !lf && lx + 15 - ly <= 1) || (!dn && !rt && 30 - lx - ly <= 1)) return null; // esquinas redondeadas
    if ((!lf && lx === 0) || (!rt && lx === 15) || (!dn && ly === 15) || (!up && ly === 0)) return PLAT.o; // contorno exterior
    if (!up && (ly < GRASS_DROP[x % 8] || ((!lf && lx <= 1) || (!rt && lx >= 14)) && ly < 2)) return PLAT[ly === 1 ? "L" : "g"]; // hierba arriba
    if (!up && ly === GRASS_DROP[x % 8]) return PLAT.G; // borde inferior de la hierba
    if ((!lf && lx === 1) || (!rt && lx === 14) || (!dn && ly === 14)) return PLAT.D; // la tierra se oscurece junto al borde
    return PLAT[dirt];
  }));
}
{
  const ts = hexGridToSprite(platformMap(["###", "###", "###"]));
  add("tileset-platform", "Tileset de 48×48: un bloque de 3×3 tiles de 16×16 con las nueve piezas de una plataforma. Arriba, hierba de 3–5 px con el borde irregular; a los lados y abajo, contorno oscuro y 1 px de tierra en sombra; las cuatro esquinas, redondeadas. El centro es solo tierra.", ["tile", "plataformas"], ts.pal, ts.rows);
  const LEVEL = ["......", "....##", ".##...", "######"];
  const px = platformMap(LEVEL);
  stamp(px, "hero-chibi", 22, 8); stamp(px, "slime", 66, 40);
  const lv = hexGridToSprite(px);
  add("map-platforms", "Un nivel de 96×64 con las mismas reglas del tileset: suelo, un escalón de dos tiles unido al suelo y una plataforma flotante a la derecha. El héroe está sobre el escalón y el slime en el suelo. Cada bloque lleva su hierba arriba y sus bordes; donde un bloque mide un solo tile de alto, ese tile junta la parte de arriba y la de abajo.", ["tile", "plataformas", "mapa"], lv.pal, lv.rows);
  const fx = platformMap(LEVEL, { flat: true });
  stamp(fx, "hero-chibi", 22, 8); stamp(fx, "slime", 66, 40);
  const fl = hexGridToSprite(fx);
  add("map-platforms-flat", "Error: el mismo nivel usando solo el tile del centro. Sin hierba ni bordes, las plataformas son rectángulos de tierra: no se sabe dónde se puede pisar y el héroe parece pegado a un muro.", ["tile", "plataformas", "mapa", "error"], fl.pal, fl.rows);
}

// ---------- sombras de contacto: los mismos props sobre la hierba, flotando, apoyados y con una sombra mal puesta
{
  const t = grassTile();
  const DARKER = { [GRASS.l]: GRASS.g, [GRASS.g]: GRASS.d, [GRASS.d]: "#1f5a36" };
  const PROPS = [["rock-clean", 4, 12], ["mushroom8", 21, 10], ["chest", 32, 8]];
  const scene = (shadow) => {
    const px = Array.from({ length: 24 }, (_, y) => Array.from({ length: 48 }, (_, x) => GRASS[t.rows[y % 16][x % 16]]));
    for (const [n, x0, y0] of PROPS) {
      const s = spriteByName(n), w = s.rows[0].length, h = s.rows.length;
      const cx = x0 + w / 2, base = y0 + h - 1;
      if (shadow === "contact") for (let y = base - 1; y <= base + 1; y++) for (let x = x0 - 1; x <= x0 + w; x++) {
        if (((x + 0.5 - cx) / (w / 2 + 1)) ** 2 + ((y + 0.5 - (base + 0.5)) / 1.6) ** 2 <= 1) px[y][x] = DARKER[px[y][x]] ?? px[y][x];
      }
      if (shadow === "wrong") for (let y = base + 3; y <= base + 4; y++) for (let x = x0 + 2; x < x0 + w + 3; x++) if (px[y]) px[y][x] = "#000000";
      stamp(px, n, x0, y0);
    }
    return hexGridToSprite(px);
  };
  const a = scene("none"), b = scene("contact"), c = scene("wrong");
  add("props-floating", "Error: una roca, una seta y un cofre sobre la hierba sin ninguna sombra. Están dibujados encima, no apoyados: parecen pegatinas que flotan sobre el suelo.", ["prop", "integración", "error"], a.pal, a.rows);
  add("props-grounded", "Los mismos props con sombra de contacto: una elipse aplanada bajo la base de cada uno, que solo oscurece un paso la hierba que tiene debajo (cada verde pasa al siguiente más oscuro). Ahora pesan y tocan el suelo.", ["prop", "integración"], b.pal, b.rows);
  add("props-shadow-wrong", "Error: la sombra en negro puro, separada 2 px de la base y desplazada a la derecha. No oscurece la hierba, la tapa: parece un agujero, y el hueco entre el objeto y su sombra hace que siga flotando.", ["prop", "integración", "error"], c.pal, c.rows);
}


// ---------- el cofre que se abre: 6 frames de 14×16 (tembleque, rendija de luz, apertura y destellos)
{
  const closed = spriteByName("chest"), open = spriteByName("chest-open");
  const OPEN_PAL = { ...closed.palette, ...open.palette, g: "#fff3c4", G: "#ffe58a" };
  const frame = (spr, dx, dy, extra = []) => {
    const g = Array.from({ length: 16 }, () => Array(14).fill("."));
    spr.rows.forEach((r, y) => [...r].forEach((k, x) => { if (k !== ".") g[dy + y][dx + x] = k; }));
    for (const [x, y, k] of extra) if (g[y]?.[x] !== undefined) g[y][x] = k;
    return g.map((r) => r.join(""));
  };
  // rendija: la tapa (filas 0–2 del cofre cerrado) sube 1 px y por el hueco sale luz
  const crack = { rows: [...closed.rows.slice(0, 3), "ogGGgGGgGGgo".replace(/./g, (c, i) => (i === 0 || i === 11 ? "o" : c)), ...closed.rows.slice(3)] };
  const rays = (n) => [[3, 1], [6, 0], [7, 0], [10, 1], [1, 3], [12, 3]].slice(0, n).map(([x, y]) => [x, y, "g"]);
  const sparks = [[2, 2, "G"], [11, 1, "g"], [5, 0, "G"]];
  const F = [
    ["chest-open-1", "Cofre, frame 1: cerrado y quieto, apoyado abajo del lienzo.", frame(closed, 1, 7)],
    ["chest-open-2", "Cofre, frame 2: tiembla. El mismo cofre 1 px a la derecha: algo se mueve dentro.", frame(closed, 2, 7)],
    ["chest-open-3", "Cofre, frame 3: tiembla al otro lado, 1 px a la izquierda del sitio original. Es la anticipación: avisa de que va a pasar algo.", frame(closed, 0, 7)],
    ["chest-open-4", "Cofre, frame 4: se entreabre. La tapa sube 1 px y por la rendija sale una franja de luz amarilla y crema.", frame(crack, 1, 6)],
    ["chest-open-5", "Cofre, frame 5: abierto. La tapa echada atrás, el oro a la vista y seis píxeles de luz crema alrededor de la tapa: el momento de más brillo.", frame(open, 1, 4, rays(6))],
    ["chest-open-6", "Cofre, frame 6: se asienta. Abierto, sin la luz de alrededor y con solo tres destellos sueltos que se apagan. Es el frame en el que se queda.", frame(open, 1, 4, sparks)],
  ];
  F.forEach(([n, d, rows]) => add(n, d, ["prop", "animación", "historia"], usedOnly(OPEN_PAL, rows), rows));
}

// ---------- luz local: una antorcha en una cueva oscura (64×40). La luz sube la rampa del suelo en anillos
const CAVE = ["#0e0c14", "#1a1622", "#2a2230", "#463238", "#6e4a3a", "#a8703e", "#e0a850"]; // de la oscuridad a la luz cálida
const TORCH = { o: "#1b1030", w: "#6b3d2e", f: "#ff8f3a", F: "#ffe58a", c: "#fff3c4" };
const caveBase = (x, y) => ((x * 7 + y * 13) % 17 === 0 ? 0 : (x * 3 + y * 5) % 11 === 0 ? 2 : 1) + (y % 8 === 0 && (x + Math.floor(y / 8) * 5) % 9 < 6 ? -1 : 0); // piedra: dos tonos y juntas
function caveFrame({ r = 15, mode = "bands", flame = 0 } = {}) {
  const tx = 20, ty = 22; // centro de la llama
  const px = Array.from({ length: 40 }, (_, y) => Array.from({ length: 64 }, (_, x) => {
    const b = Math.max(0, caveBase(x, y)), d = Math.hypot((x + 0.5 - tx) / 1.15, y + 0.5 - ty);
    if (mode === "bands") { const lift = d < r * 0.4 ? 3 : d < r * 0.7 ? 2 : d < r ? 1 : 0; return CAVE[Math.min(6, b + lift)]; }
    if (mode === "overlay") return d < r ? "#c07840" : CAVE[b]; // un círculo naranja encima: borra la piedra
    // degradado continuo: cada píxel su propio color
    const t = Math.max(0, 1 - d / r), a = CAVE[b], c = (h) => parseInt(h.slice(1), 16);
    const mixc = (k) => Math.round(((c(a) >> k) & 255) * (1 - t) + ((c("#e0a850") >> k) & 255) * t);
    return "#" + [16, 8, 0].map((k) => mixc(k).toString(16).padStart(2, "0")).join("");
  }));
  // la antorcha: un palo en la pared y la llama, que cambia de forma en cada frame
  const stick = [[20, 24], [20, 25], [20, 26], [20, 27], [20, 28]];
  for (const [x, y] of stick) px[y][x] = TORCH.w;
  for (const [x, y] of [[19, 24], [21, 24], [19, 28], [21, 28], [20, 29]]) px[y][x] = TORCH.o;
  const FL = [
    [[20, 19, "F"], [19, 20, "f"], [20, 20, "c"], [21, 20, "f"], [19, 21, "f"], [20, 21, "F"], [21, 21, "f"], [19, 22, "f"], [20, 22, "f"], [21, 22, "f"], [20, 23, "f"]],
    [[21, 19, "F"], [20, 20, "F"], [21, 20, "f"], [19, 21, "f"], [20, 21, "c"], [21, 21, "f"], [19, 22, "f"], [20, 22, "F"], [21, 22, "f"], [20, 23, "f"]],
    [[19, 18, "f"], [20, 19, "F"], [19, 20, "f"], [20, 20, "F"], [21, 20, "f"], [19, 21, "f"], [20, 21, "c"], [21, 21, "f"], [19, 22, "f"], [20, 22, "f"], [21, 22, "f"], [20, 23, "f"]],
  ][flame];
  for (const [x, y, k] of FL) px[y][x] = TORCH[k];
  return px;
}
{
  // paleta fija para los tres frames del parpadeo: las mismas letras siempre
  const letters = "0123456", FIX = Object.fromEntries(CAVE.map((h, i) => [letters[i], h]));
  const PAL = { ...FIX, o: TORCH.o, w: TORCH.w, f: TORCH.f, F: TORCH.F, c: TORCH.c };
  const toRows = (px) => px.map((r) => r.map((h) => Object.keys(PAL).find((k) => PAL[k] === h)).join(""));
  const FR = [[15, 0], [14, 1], [16, 2]];
  const DESC = [
    "Cueva con antorcha, frame 1: la luz sube la piedra tres pasos de su rampa junto a la llama, dos en el anillo siguiente y uno en el borde. Fuera del radio, la cueva casi negra. Tres anillos, no un degradado.",
    "Cueva con antorcha, frame 2: la llama se inclina y el radio de la luz se encoge 1 px: los anillos se cierran un poco.",
    "Cueva con antorcha, frame 3: la llama se estira hacia arriba y el radio crece 1 px. Alternando los tres frames, la luz respira como un fuego.",
  ];
  FR.forEach(([r, fl], i) => { const rows = toRows(caveFrame({ r, flame: fl })); add(`torch-${i + 1}`, DESC[i], ["luz", "escena", "animación"], usedOnly(PAL, rows), rows); });
  const ov = hexGridToSprite(caveFrame({ mode: "overlay" }));
  add("torch-overlay", "Error: la luz como un círculo naranja plano pintado encima. Dentro del círculo, la piedra desaparece: no hay juntas ni texturas, y no se nota que la luz sea más fuerte junto a la llama.", ["luz", "escena", "error"], ov.pal, ov.rows);
  const gr = caveFrame({ mode: "smooth" });
  // el degradado continuo produce cientos de colores: se cuantiza a 60 para que quepa en la paleta, y sigue siendo un degradado
  const q = gr.map((r) => r.map((h) => { const n = parseInt(h.slice(1), 16); return "#" + [16, 8, 0].map((k) => Math.min(255, Math.round(((n >> k) & 255) / 24) * 24).toString(16).padStart(2, "0")).join(""); }));
  const gs = hexGridToSprite(q);
  add("torch-smooth", "Error: la luz como un degradado continuo, con decenas de colores entre la oscuridad y el naranja. De cerca se ven escalones sucios; la paleta se dispara y ya no casa con el resto del juego.", ["luz", "escena", "error"], gs.pal, gs.rows);
}

// ---------- accesibilidad del color: dos slimes que solo se distinguen por el tono, simulados con deuteranopía
// Simulación de Machado et al. (2009), deuteranopía completa, en RGB lineal
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const unlin = (v) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
const DEUT = [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]];
const deutan = (hex) => {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(lin);
  return "#" + DEUT.map((row) => Math.min(255, Math.max(0, unlin(row.reduce((a, m, i) => a + m * c[i], 0))))).map((v) => v.toString(16).padStart(2, "0")).join("");
};
{
  const sl = spriteByName("slime");
  const pair = (palA, palB) => {
    const px = Array.from({ length: 8 }, () => Array(24).fill(null));
    [[palA, 1], [palB, 13]].forEach(([pal, x0]) => sl.rows.forEach((r, y) => [...r].forEach((k, x) => { if (k !== ".") px[y][x0 + x] = pal[k]; })));
    return px;
  };
  // el coral está elegido para que, con deuteranopía, se vea casi igual que el verde (base y sombra)
  const GREEN = sl.palette, RED = { ...sl.palette, g: "#faa082", G: "#a05f50", h: "#ffe0d0" };
  const RED_DARK = { ...sl.palette, g: "#a8243a", G: "#5a1020", h: "#ff9a9a" }; // más oscuro: se distingue por valor, no solo por tono
  const sim = (px) => px.map((r) => r.map((h) => (h ? deutan(h) : null)));
  const S = [
    ["cb-pair", "Dos slimes que solo se diferencian por el tono: uno verde y otro rojo coral de valor parecido. Con visión normal se distinguen bien.", pair(GREEN, RED), ["color", "accesibilidad"]],
    ["cb-pair-deutan", "Los mismos dos slimes simulando deuteranopía (no se distingue el rojo del verde). Los dos se vuelven casi del mismo ocre claro: quien tenga este tipo de daltonismo no sabe cuál es cuál.", sim(pair(GREEN, RED)), ["color", "accesibilidad", "error"]],
    ["cb-fixed", "El slime rojo con una rampa roja mucho más oscura: ahora los dos se diferencian también por el valor (claro frente a oscuro), no solo por el tono.", pair(GREEN, RED_DARK), ["color", "accesibilidad"]],
    ["cb-fixed-deutan", "La versión corregida simulando deuteranopía: los tonos se parecen, pero uno es claro y el otro oscuro. Se distinguen al primer vistazo.", sim(pair(GREEN, RED_DARK)), ["color", "accesibilidad"]],
  ];
  for (const [n, d, px, tags] of S) { const s = hexGridToSprite(px); add(n, d, tags, s.pal, s.rows); }
}


// ---------- un jefe: el slime redibujado a 30×24 (3×) frente al slime escalado ×3
{
  const K = { o: "#1b1030", G: "#14532d", g: "#1f8a4c", m: "#4ade80", l: "#86efac", h: "#d8ffe6", w: "#ffffff", e: "#1b1030", y: "#f2c14e", Y: "#a8661c", r: "#e8484f" };
  const W = 30, H = 24, cx = 15, base = 22;
  const L = (() => { const v = [-0.4, -0.7, 0.6]; const n = Math.hypot(...v); return v.map((a) => a / n); })();
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    const X = x + 0.5, Y = y + 0.5;
    if (Y > base + 0.5) return ".";
    const nx = (X - cx) / 14, ny = (Y - base) / 15; // cúpula: media elipse apoyada en la base
    if (nx * nx + ny * ny > 1) return ".";
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), k = nx * L[0] + ny * L[1] + nz * L[2];
    if (Y > base - 1.5) return "G"; // la base en contacto con el suelo, en la sombra más oscura
    return k > 0.9 ? "l" : k > 0.6 ? "m" : k > 0.25 ? "g" : "G";
  }));
  // brillo: un cluster de 3 + 1 píxel suelto, arriba a la izquierda (no un píxel solo)
  for (const [x, y] of [[8, 10], [9, 10], [8, 11], [11, 9]]) g[y][x] = "h";
  // ojos de 3×4 con un brillo blanco cada uno; boca de 6 px con un colmillo
  for (const ex of [10, 17]) for (let y = 13; y < 17; y++) for (let x = ex; x < ex + 3; x++) g[y][x] = "e";
  g[13][10] = "w"; g[13][17] = "w";
  for (let x = 12; x < 18; x++) g[19][x] = "e";
  g[20][16] = "w";
  // corona dorada de 10 px con tres puntas y una gema
  const crown = ["y...y...y.", "yy.yyy.yyy", "yyyyryyyyy", "YYYYYYYYYY"];
  crown.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") g[3 + dy][10 + dx] = c; }));
  // contorno exterior
  const filled = (x, y) => (g[y]?.[x] ?? ".") !== ".";
  const out = g.map((r, y) => r.map((c, x) => (c === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled(x + dx, y + dy)) ? "o" : c)));
  const rows = out.map((r) => r.join(""));
  add("slime-king", "Jefe de 30×24: el slime REDIBUJADO a 3×, no escalado. Cuatro verdes con la luz arriba a la izquierda, la base en la sombra más oscura, un brillo en grupo, ojos de 3×4 con su brillo blanco, una boca con colmillo y una corona dorada con gema. Mismo diseño, más información.", ["criatura", "jefe"], usedOnly(K, rows), rows);
  const sl = spriteByName("slime");
  const x3 = Array.from({ length: 24 }, (_, y) => Array.from({ length: 30 }, (_, x) => sl.rows[Math.floor(y / 3)][Math.floor(x / 3)]).join(""));
  add("slime-x3", "Error: el slime de 10×8 escalado ×3 con vecino más cercano. Cada píxel es ahora un bloque de 3×3: el contorno mide 3 px de grueso, el brillo es un cuadrado y no se ha añadido nada. Más grande, pero no más detallado: parece de otro juego.", ["criatura", "jefe", "error"], sl.palette, x3);
}

// ---------- vuelo: el murciélago aletea en 3 poses (12×12). El cuerpo sube cuando las alas bajan
{
  const BATP = spriteByName("bat").palette;
  const UP = spriteByName("bat").rows;
  const MID = [".....oo.....", "....obbo....", "oooooRRooooo", "owwwobbowwwo", ".owwwbbwwwo.", "..o.obbo.o..", "....o..o...."];
  const DOWN = [".....oo.....", "....obbo....", "....oRRo....", "..oowbbwoo..", ".owwwbbwwwo.", "owwwwbbwwwwo", "owwoobboowwo", "owo.o..o.owo", "oo........oo", "o..........o"];
  const place = (rows, dy) => Array.from({ length: 12 }, (_, y) => (rows[y - dy] ?? "............"));
  const F = [
    ["bat-fly-1", "Murciélago, frame 1: alas arriba (el sprite del curso). Las puntas suben hasta la altura de las orejas.", place(UP, 2)],
    ["bat-fly-2", "Murciélago, frame 2: alas en horizontal, abiertas del todo a la altura de los ojos. Es el frame de paso entre arriba y abajo.", place(MID, 2)],
    ["bat-fly-3", "Murciélago, frame 3: alas abajo, con las puntas por debajo de los pies. El cuerpo está 1 px más arriba: el golpe de ala lo levanta.", place(DOWN, 1)],
  ];
  F.forEach(([n, d, rows]) => add(n, d, ["criatura", "animación", "vuelo"], usedOnly(BATP, rows), rows));
}

// ---------- clima: lluvia en dos capas sobre la escena final, oscurecida (80×48, 8 frames en bucle)
{
  const base = spriteByName("scene-final");
  const rgbA = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hexA = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const stormy = (h) => { const [r, g, b] = rgbA(h), l = 0.3 * r + 0.59 * g + 0.11 * b; return hexA([r, g, b].map((v, i) => (v * 0.55 + l * 0.45) * 0.72 + [0, 4, 18][i])); }; // menos saturación, menos valor, algo de azul
  const LIGHT = ["#ffffff", "#ffe58a", "#ff8f3a"]; // el impacto emite luz: no se apaga con el día gris y sigue siendo el foco
  const dark = base.rows.map((r) => [...r].map((k) => (k === "." ? null : LIGHT.includes(base.palette[k]) ? base.palette[k] : stormy(base.palette[k]))));
  const FAR = "#8fa3c0", NEAR = "#c9d6ea", SPL = "#e8f0fa";
  // posiciones pseudoaleatorias (hash): sin cadenas ni diagonales que delaten una fórmula
  const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const drops = (n, seed) => Array.from({ length: n }, (_, i) => [Math.floor(hash(i, seed) * 80), Math.floor(hash(i, seed + 17) * 48)]);
  const FARD = drops(26, 1), NEARD = drops(12, 5);
  const SPLASH = [[12, 44], [33, 40], [52, 45], [70, 41], [24, 30], [61, 34]];
  const frame = (f, { straight = false } = {}) => {
    const px = dark.map((r) => r.slice());
    const put = (x, y, c) => { x = ((Math.round(x) % 80) + 80) % 80; if (y >= 0 && y < 48) px[y][x] = c; };
    if (straight) { for (let x = 3; x < 80; x += 6) for (let y = 0; y < 48; y++) if ((y + x) % 6 < 3) put(x, y, NEAR); return px; }
    // lejos: gotas de 2 px que caen 6 px por frame; cerca: gotas de 4 px que caen 12. Las dos con el mismo viento.
    for (const [x0, y0] of FARD) { const y = (y0 + 6 * f) % 48; for (let i = 0; i < 2; i++) put(x0 + (y + i) * 0.25, y + i, FAR); }
    for (const [x0, y0] of NEARD) { const y = (y0 + 12 * f) % 48; for (let i = 0; i < 4; i++) put(x0 + (y + i) * 0.25, y + i, NEAR); }
    SPLASH.forEach(([x, y], i) => { if ((i + f) % 4 === 0) { put(x - 1, y, SPL); put(x + 1, y, SPL); } else if ((i + f) % 4 === 1) put(x, y - 1, SPL); });
    return px;
  };
  const frames = Array.from({ length: 8 }, (_, f) => frame(f));
  // paleta fija para los 8 frames: las mismas letras siempre
  const keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const all = [...new Set(frames.flat(2).filter(Boolean))];
  const PALR = Object.fromEntries(all.map((h, i) => [keys[i], h]));
  const inv = Object.fromEntries(all.map((h, i) => [h, keys[i]]));
  frames.forEach((px, f) => {
    const rows = px.map((r) => r.map((h) => (h ? inv[h] : ".")).join(""));
    add(`rain-${f + 1}`, `Lluvia, frame ${f + 1} de 8: la escena final más oscura, menos saturada y algo azulada, salvo el impacto, que conserva su luz. Delante, dos capas de lluvia inclinada por el viento: gotas lejanas de 2 px, más oscuras, que caen 6 px por frame, y gotas cercanas de 4 px, más claras, que caen 12. Salpicaduras de 1–2 px en el suelo.`, ["escena", "clima", "animación"], usedOnly(PALR, rows), rows);
  });
  const st = hexGridToSprite(frame(0, { straight: true }));
  add("rain-straight", "Error: la lluvia como líneas verticales discontinuas, todas iguales y repartidas cada 6 px. Sin profundidad ni viento: parecen rayas sobre la imagen, o una reja.", ["escena", "clima", "error"], st.pal, st.rows);
}


// ---------- equipo modular: casco y peto como capas que se ponen encima del héroe (16×24)
{
  const hero = spriteByName("hero-chibi");
  const GEAR = { o: "#1b1030", L: "#c9d1dc", M: "#8f9bab", D: "#5c6676", r: "#c2413b" };
  const E = "................";
  const helmet = [E, ".......rr.......", "....oooooooo....", "...oLLMMMMMMo...", "..oLMMMMMMMMDo..", "..oLMMMMMMMMDDo.", "..oDDDDDDDDDDDo.", "..oM.........MDo", "..oM.........Do.", ...Array(15).fill(E)];
  const armor = [...Array(14).fill(E), "...oLMMMMMMMo...", "..osLMMMMMMDso..", "..osMMMMMMMDso..", ...Array(7).fill(E)];
  const over = (base, layer) => base.map((r, y) => [...r].map((c, x) => (layer[y][x] !== "." ? layer[y][x] : c)).join(""));
  add("gear-helmet", "Capa del casco (16×24, el resto transparente): calota de hierro con luz arriba a la izquierda, una banda oscura en la frente, carrilleras a los lados de la cara y una cresta roja de 2 px. Está dibujada encima de la cabeza del héroe, siguiendo su silueta.", ["personaje", "equipo"], usedOnly(GEAR, helmet), helmet);
  add("gear-armor", "Capa del peto (16×24, el resto transparente): una placa de hierro sobre el pecho, con la luz a la izquierda y la sombra a la derecha. Repinta los brazos con los mismos colores del héroe y deja a la vista el cinturón y las piernas.", ["personaje", "equipo"], usedOnly({ ...GEAR, s: hero.palette.s }, armor), armor);
  const armored = over(over(hero.rows, helmet), armor);
  add("hero-armored", "El héroe con el casco y el peto puestos: las dos capas encima del sprite base. Misma silueta, misma luz y mismo contorno: parece el mismo personaje, mejor equipado.", ["personaje", "equipo"], usedOnly({ ...hero.palette, ...GEAR }, armored), armored);
  const GOLD = { ...GEAR, L: "#fff3c4", M: "#f2c14e", D: "#a8661c", r: "#3b6fd1" };
  add("hero-armored-gold", "La misma armadura con otra paleta (oro y cresta azul): las capas de equipo admiten palette swap igual que los enemigos de P5-04. Un dibujo, varios equipos.", ["personaje", "equipo", "paleta"], usedOnly({ ...hero.palette, ...GOLD }, armored), armored);
  // error: un casco dibujado aparte, como una caja, que no sigue la cabeza ni la luz del personaje
  const BAD = { ...hero.palette, k: "#000000", q: "#a8b0bc", Q: "#6a7280" };
  const pasted = hero.rows.map((r) => [...r]);
  const box = ["kkkkkkkkkk", "kQQQQQQQqk", "kQQQQQQQqk", "kQQQQQQQqk", "kkkkkkkkkk"]; // q claro a la derecha: la luz al revés
  box.forEach((r, dy) => [...r].forEach((c, dx) => { pasted[1 + dy][3 + dx] = c; }));
  add("hero-helmet-pasted", "Error: un casco hecho aparte y pegado encima. Es una caja de 10×5 con contorno negro puro, la luz a la DERECHA (al revés que el héroe) y no sigue la cabeza: es más estrecha y no baja hasta la frente, así que asoma una fila entera de pelo debajo y un píxel de pelo a un lado.", ["personaje", "equipo", "error"], usedOnly(BAD, pasted.map((r) => r.join(""))), pasted.map((r) => r.join("")));
}

// ---------- HUD sobre la escena (80×48): legible y fuera del foco, frente a uno que compite con el arte
{
  const sceneHex = (() => { const s = spriteByName("scene-final"); return s.rows.map((r) => [...r].map((k) => (k === "." ? null : s.palette[k]))); })();
  const put = (px, x, y, c) => { if (px[y]?.[x] !== undefined) px[y][x] = c; };
  const bar = spriteByName("ui-bar-full");
  const stampRows = (px, spr, x0, y0) => spr.rows.forEach((r, y) => [...r].forEach((k, x) => { if (k !== ".") put(px, x0 + x, y0 + y, spr.palette[k]); }));
  const coin5 = [".ooo.", "oyYyo", "oyYyo", "oyYyo", ".ooo."], COINP = { o: "#5a3a10", y: "#f2c14e", Y: "#c98a2a" };
  const text = (px, str, x0, y0, ink, shade) => typeset(str, { shadow: !!shade }).forEach((r, y) => [...r].forEach((c, x) => { if (c === "w") put(px, x0 + x, y0 + y, ink); else if (c === "d" && shade) put(px, x0 + x, y0 + y, shade); }));
  // bien: una franja de HUD de 9 px encima de la escena (la escena no se tapa) con la barra a la izquierda y las monedas a la derecha
  const good = [...Array.from({ length: 9 }, () => Array(80).fill("#14121c")), ...sceneHex.map((r) => r.slice())];
  for (let x = 0; x < 80; x++) good[8][x] = "#2a2d3a"; // línea que separa el HUD del juego
  stampRows(good, bar, 2, 1);
  coin5.forEach((r, y) => [...r].forEach((c, x) => { if (c !== ".") put(good, 66 + x, 2 + y, COINP[c]); }));
  text(good, "12", 72, 2, "#fff3c4", null);
  // mal: los mismos elementos encima de la escena, sin franja, en el peor sitio
  const bad = [...Array.from({ length: 9 }, () => Array(80).fill("#14121c")), ...sceneHex.map((r) => r.slice())].map((r, y) => (y < 9 ? r.map(() => null) : r));
  stampRows(bad, bar, 24, 15); // encima del impacto: tapa el foco de la escena
  coin5.forEach((r, y) => [...r].forEach((c, x) => { if (c !== ".") put(bad, 76 + x, 52 + y, COINP[c]); })); // pegado a la esquina, cortado
  text(bad, "12", 69, 51, "#6fd17f", null); // verde claro sobre hierba y agua, sin sombra
  const g = hexGridToSprite(good), b = hexGridToSprite(bad);
  add("hud-good", "La escena final (80×48) con un HUD legible en una franja oscura de 9 px encima: la barra de vida a la izquierda y una moneda con el número 12 en crema a la derecha, con 1–2 px de margen. Una línea separa el HUD del juego, y la escena queda entera a la vista.", ["ui", "escena"], g.pal, g.rows);
  add("hud-bad", "Error: el mismo HUD puesto encima de la escena, sin franja (arriba queda vacío para comparar con el bueno). La barra tapa casi todo el impacto, el foco de la escena (solo asoman sus puntas); la moneda está pegada a la esquina de abajo y cortada; y el 12 va en verde claro sin sombra sobre el agua: casi no se lee.", ["ui", "escena", "error"], b.pal, b.rows);
}

// ---------- paletas limitadas: la escena final reducida a 8 colores, con una buena paleta y con una mala
{
  const s = spriteByName("scene-final");
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const dist = (a, b) => { const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b), rm = (r1 + r2) / 2; return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2); }; // distancia «redmean», cercana a la percepción
  const GOOD8 = ["#1b1030", "#2c7a48", "#6fd17f", "#2a6fc9", "#8a8698", "#f2c29b", "#8a5a3c", "#fff3c4"]; // de muy oscuro a muy claro, con verde, azul, gris, piel y madera
  const BAD8 = ["#4a8a4a", "#3a6fb0", "#b04a4a", "#8a6ab0", "#b0904a", "#4ab0a0", "#a07050", "#7a7a8a"]; // todos de valor medio: sin oscuros ni claros
  const reduce = (pal) => s.rows.map((r) => [...r].map((k) => (k === "." ? "." : String(pal.reduce((bi, c, i) => (dist(s.palette[k], c) < dist(s.palette[k], pal[bi]) ? i : bi), 0)))).join(""));
  const palObj = (pal) => Object.fromEntries(pal.map((c, i) => [String(i), c]));
  const rg = reduce(GOOD8), rb = reduce(BAD8);
  add("pal8-good", "La escena final reducida a 8 colores bien elegidos: un casi negro para los contornos, dos verdes, un azul, un gris, la piel, un marrón y un crema casi blanco. Cada color de la escena se cambia por el más parecido. Se pierden matices, pero se lee todo: hay oscuros y claros.", ["paleta", "escena"], usedOnly(palObj(GOOD8), rg), rg);
  add("pal8-bad", "Error: la misma escena con 8 colores de valor medio, sin ningún oscuro ni ningún claro. Los contornos, las sombras y el impacto caen en los mismos tonos que el resto: la escena se aplana y el foco desaparece.", ["paleta", "escena", "error"], usedOnly(palObj(BAD8), rb), rb);
  const swatch = (pal) => Array.from({ length: 6 }, () => pal.map((_, i) => String(i).repeat(6)).join(""));
  add("pal8-good-swatch", "Las 8 muestras de la buena paleta, de 6×6 cada una, en el orden de la lista: casi negro, verde oscuro, verde claro, azul, gris, piel, marrón y crema.", ["paleta"], palObj(GOOD8), swatch(GOOD8));
  add("pal8-bad-swatch", "Las 8 muestras de la mala paleta: verde, azul, rojo, violeta, ocre, turquesa, marrón y gris, todos de valor medio. En grises son casi la misma mancha.", ["paleta", "error"], palObj(BAD8), swatch(BAD8));
}


// ---------- utilidad: varios frames con UNA paleta fija (las mismas letras en todos), para animarlos juntos
function fixedFrames(frames) {
  const keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const all = [...new Set(frames.flat(2).filter(Boolean))];
  if (all.length > keys.length) throw new Error("fixedFrames: demasiados colores");
  const pal = Object.fromEntries(all.map((h, i) => [keys[i], h])), inv = Object.fromEntries(all.map((h, i) => [h, keys[i]]));
  return frames.map((px) => { const rows = px.map((r) => r.map((h) => (h ? inv[h] : ".")).join("")); return { rows, pal: usedOnly(pal, rows) }; });
}
const toHexGrid = (name) => { const s = spriteByName(name); return s.rows.map((r) => [...r].map((k) => (k === "." ? null : s.palette[k]))); };
const shadeHex = (h, f) => "#" + [16, 8, 0].map((k) => Math.round(((parseInt(h.slice(1), 16) >> k) & 255) * f).toString(16).padStart(2, "0")).join("");

// ---------- muros en vista 3/4: cada muro enseña su cara de ARRIBA y, si delante hay suelo, su cara de DELANTE
const DUNP = { cap: "#5e5a6e", capL: "#7d7894", capD: "#3e3a4a", brick: "#8a8698", brickD: "#6a6678", mortar: "#3e3a4a", floor: "#4a4656", floorD: "#3a3646", floorL: "#5a566a", shadow: "#2a2636", o: "#1b1030" };
function dungeonMap(mask, { flat = false } = {}) {
  const th = mask.length, tw = mask[0].length;
  const wall = (tx, ty) => (mask[ty]?.[tx] ?? "W") === "W";
  return Array.from({ length: th * 16 }, (_, y) => Array.from({ length: tw * 16 }, (_, x) => {
    const tx = Math.floor(x / 16), ty = Math.floor(y / 16), lx = x % 16, ly = y % 16;
    const brick = () => { const row = Math.floor(ly / 4), off = row % 2 ? 4 : 0; return ly % 4 === 3 || (lx + off) % 8 === 7 ? DUNP.mortar : (lx + ly) % 7 === 0 ? DUNP.brickD : DUNP.brick; };
    if (wall(tx, ty)) {
      if (flat) return brick(); // error: todo el muro con la misma textura de ladrillo
      if (!wall(tx, ty + 1)) {
        // cara de delante: un remate de 3 px (la parte de arriba del muro, vista de canto), una línea de contorno y los ladrillos
        if (ly < 3) return ly === 0 ? DUNP.capL : DUNP.cap;
        if (ly === 3) return DUNP.o;
        return brick();
      }
      // cara de arriba: oscura y lisa, con un borde claro donde da al suelo por los lados o por arriba
      if ((!wall(tx - 1, ty) && lx === 0) || (!wall(tx + 1, ty) && lx === 15) || (!wall(tx, ty - 1) && ly === 0)) return DUNP.o;
      if ((!wall(tx - 1, ty) && lx === 1) || (!wall(tx + 1, ty) && lx === 14) || (!wall(tx, ty - 1) && ly === 1)) return DUNP.capL;
      return (lx * 3 + ly * 5) % 13 === 0 ? DUNP.capD : DUNP.cap;
    }
    // suelo: losas de 8×8; justo debajo de un muro, una franja de sombra de 2 px (el muro tapa la luz)
    if (!flat && wall(tx, ty - 1) && ly < 2) return DUNP.shadow;
    if (lx % 8 === 0 || ly % 8 === 0) return DUNP.floorD;
    return (lx + ly * 3) % 11 === 0 ? DUNP.floorL : DUNP.floor;
  }));
}
{
  const MASK = ["WWWWWW", "WFFFFW", "WFWWFW", "WFFFFW", "WWWWWW"];
  const good = dungeonMap(MASK), bad = dungeonMap(MASK, { flat: true });
  stamp(good, "hero-chibi", 64, 36); stamp(bad, "hero-chibi", 64, 36);
  const g = hexGridToSprite(good), b = hexGridToSprite(bad);
  add("map-dungeon", "Sala de mazmorra en vista 3/4 (96×80, 6×5 tiles). Los muros con suelo delante enseñan su cara de delante: un remate claro de 3 px, una línea oscura y ladrillos. Los demás muros enseñan solo la cara de arriba: lisa, de un gris medio y con un borde claro donde dan al suelo. Debajo de cada muro con frente, una franja de sombra de 2 px en el suelo. El bloque del centro enseña su frente, con el remate encima.", ["tile", "mazmorra", "mapa"], g.pal, g.rows);
  add("map-dungeon-flat", "Error: la misma sala con todos los muros iguales, ladrillo por todas partes y sin sombra en el suelo. No se sabe qué es la parte de arriba de un muro ni qué es su frente: parece un laberinto visto desde arriba sin altura.", ["tile", "mazmorra", "mapa", "error"], b.pal, b.rows);
  const cut = (px, tx, ty) => hexGridToSprite(px.slice(ty * 16, ty * 16 + 16).map((r) => r.slice(tx * 16, tx * 16 + 16)));
  const front = cut(good, 2, 0), top = cut(good, 3, 4), floor = cut(good, 3, 1);
  add("tile-wall-front", "Tile de muro con cara de delante (16×16): arriba, el remate de 3 px (una fila clara y dos medias), una línea oscura y debajo los ladrillos en hiladas de 4 px con las juntas alternas.", ["tile", "mazmorra"], front.pal, front.rows);
  add("tile-wall-top", "Tile de muro visto desde arriba (16×16): la cara de arriba, lisa y de un gris medio, con contorno y un borde claro de 1 px por el lado de arriba, que da al suelo.", ["tile", "mazmorra"], top.pal, top.rows);
  add("tile-floor-shadow", "Tile de suelo justo debajo de un muro (16×16): losas de 8×8 con juntas oscuras y una franja de sombra de 2 px arriba, donde el muro tapa la luz.", ["tile", "mazmorra"], floor.pal, floor.rows);
}

// ---------- iconos de habilidad con estado: listo, en enfriamiento (barrido) y bloqueado (16×16)
{
  const FR = { o: "#1b1030", L: "#c9d1dc", M: "#8f9bab", D: "#5c6676", bg: "#2a2d3a" };
  const base = () => {
    const px = Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
      if (x === 0 || y === 0 || x === 15 || y === 15) return (x === 0 || x === 15) && (y === 0 || y === 15) ? null : FR.o;
      if (x === 1 || y === 1) return FR.L; // bisel: claro arriba-izquierda
      if (x === 14 || y === 14) return FR.D;
      return FR.bg;
    }));
    toHexGrid("potion").forEach((r, y) => r.forEach((h, x) => { if (h) px[2 + y][3 + x] = h; }));
    return px;
  };
  // enfriamiento: un barrido como un reloj desde arriba, en el sentido de las agujas; lo que falta por recargar, oscuro
  const sweep = (frac) => base().map((r, y) => r.map((h, x) => {
    if (!h || x < 2 || y < 2 || x > 13 || y > 13) return h;
    const a = (Math.atan2(x + 0.5 - 8, -(y + 0.5 - 8)) / (2 * Math.PI) + 1) % 1; // 0 arriba, crece hacia la derecha
    return a >= 1 - frac ? shadeHex(h, 0.35) : h;
  }));
  const ready = base();
  for (const [x, y] of [[2, 2], [3, 2], [2, 3]]) ready[y][x] = "#ffffff"; // destello en la esquina: «ya puedes usarla»
  const frames = [sweep(1), sweep(0.75), sweep(0.5), sweep(0.25), ready];
  const D = [
    "Icono en enfriamiento, recién usado: todo el interior oscurecido al 35 %. El marco no cambia.",
    "Enfriamiento al 25 %: la parte clara empieza arriba y gira como la aguja de un reloj; tres cuartos siguen oscuros.",
    "Enfriamiento al 50 %: la mitad derecha ya está clara.",
    "Enfriamiento al 75 %: solo queda oscuro el cuarto de arriba a la izquierda.",
    "Icono listo: la poción con todos sus colores dentro del marco con bisel y un destello blanco de 3 px en la esquina de arriba a la izquierda.",
  ];
  fixedFrames(frames).forEach((f, i) => add(`icon-cd-${i + 1}`, D[i], ["ui", "icono", "animación"], f.pal, f.rows));
  // bloqueado: en grises y con un candado
  const gray = (h) => { const n = parseInt(h.slice(1), 16), l = Math.round((0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) * 0.7); return "#" + [l, l, l].map((v) => v.toString(16).padStart(2, "0")).join(""); };
  const locked = base().map((r) => r.map((h) => (h ? gray(h) : h)));
  const LOCK = ["..ooo..", ".o...o.", ".o...o.", "ooooooo", "oyyyyyo", "oyyoyyo", "oyyyyyo", "ooooooo"];
  LOCK.forEach((r, y) => [...r].forEach((c, x) => { if (c === "o") locked[7 + y][8 + x - 1] = "#1b1030"; else if (c === "y") locked[7 + y][8 + x - 1] = "#f2c14e"; }));
  const lk = hexGridToSprite(locked);
  add("icon-locked", "Icono bloqueado: el mismo icono en grises y más oscuro, con un candado dorado de 7×8 abajo a la derecha. Se reconoce qué habilidad es, pero se ve que todavía no se puede usar.", ["ui", "icono"], lk.pal, lk.rows);
  const dim = hexGridToSprite(base().map((r) => r.map((h) => (h ? shadeHex(h, 0.6) : h))));
  add("icon-cd-bad", "Error: el enfriamiento hecho solo oscureciendo todo el icono (marco incluido) al 60 %. No dice cuánto falta, y oscurecido casi igual que el bloqueado: el jugador no sabe si espera o si no puede.", ["ui", "icono", "error"], dim.pal, dim.rows);
}

// ---------- escala: los objetos del curso a la escala del héroe (una puerta como referencia) y una escena sin escala
function doorSprite(w, h) {
  const P = { o: "#1b1030", f: "#6b3d2e", w: "#a0603a", W: "#8a5030", k: "#f2c14e" };
  const rows = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => {
    const r = w / 2, inArch = y >= r || Math.hypot(x + 0.5 - w / 2, y + 0.5 - r) <= r; // arco de medio punto arriba
    if (!inArch) return ".";
    const edge = x === 0 || x === w - 1 || y === h - 1 || (y < r && Math.hypot(x + 0.5 - w / 2, y + 0.5 - r) > r - 1);
    if (edge) return "o";
    const frame = x === 1 || x === w - 2 || (y < r && Math.hypot(x + 0.5 - w / 2, y + 0.5 - r) > r - 2);
    if (frame) return "f";
    if (x === w - 4 && y === Math.round(h * 0.55)) return "k"; // pomo
    return x % 3 === 0 ? "W" : "w"; // tablas verticales
  }).join(""));
  return { pal: usedOnly(P, rows), rows };
}
{
  const d = doorSprite(12, 28), ds = doorSprite(8, 14);
  add("door", "Puerta de 12×28 con arco de medio punto, marco oscuro, tablas verticales y un pomo dorado. Mide 28 px, 7 más que lo dibujado del héroe (21, en un lienzo de 24): por ella cabe una persona.", ["prop", "escala"], d.pal, d.rows);
  add("door-small", "Error de escala: la misma puerta a 8×14, que al lado del héroe le llega a los ojos. Así dibujada, nadie podría pasar por ella.", ["prop", "escala", "error"], ds.pal, ds.rows);
  const ground = (W, H) => Array.from({ length: H }, (_, y) => Array.from({ length: W }, () => (y >= H - 3 ? (y === H - 3 ? "#3fa45b" : "#2c7a48") : null)));
  // cada sprite se apoya en el suelo por su última fila DIBUJADA (no por el borde del lienzo)
  const lineup = (items, W) => { const px = ground(W, 32); for (const [n, x] of items) { const s = spriteByName(n); let last = s.rows.length - 1; while (last > 0 && !/[^.]/.test(s.rows[last])) last--; stamp(px, n, x, 29 - (last + 1)); } return hexGridToSprite(px); };
  const good = lineup([["door", 2], ["hero-chibi", 16], ["chest", 34], ["slime", 48], ["mushroom8", 61], ["rock-clean", 71]], 92);
  const bad = lineup([["door-small", 2], ["hero-chibi", 12], ["chest", 30], ["mushroom16", 44], ["slime-king", 60]], 92);
  add("scale-good", "Fila de 92×32 con todo a la misma escala sobre el suelo: puerta (28), héroe (21 dibujados), cofre (9, con la tapa a la altura de las manos: algo exagerado, al estilo chibi), slime (8), seta (8) y roca (8). La puerta y el héroe dan la medida y todo lo demás se lee en relación con ellos.", ["escala", "escena"], good.pal, good.rows);
  add("scale-bad", "Error: la misma fila sin escala común. La puerta (14) es más baja que el héroe, la seta de 16 es casi el doble de alta que el cofre y el slime normal se ha cambiado por el jefe de 30×24. Cada objeto está bien dibujado, pero juntos no tienen sentido.", ["escala", "escena", "error"], bad.pal, bad.rows);
}

// ---------- derrota del slime: destello, aplastado, charco, burbujas que suben y una mancha (16×20, paleta fija)
{
  const SP = { ...SLIME_PAL, w: "#ffffff" };
  const toHex = (rows) => rows.map((r) => [...r].map((k) => (k === "." ? null : SP[k])));
  const f1 = toHex(slimeFrame(10, 8, 19).map((r) => r.replace(/[gGh]/g, "w"))); // destello: el interior en blanco, los ojos y el contorno se quedan
  const sq = slimeFrame(13, 6, 19).map((r) => r.replace(/e/g, "g").split(""));
  const eyeRow = sq.findIndex((r) => r.includes("g") && r.indexOf("g") > 0) + 2;
  for (const x of [5, 6, 9, 10]) sq[eyeRow][x] = "e"; // ojos cerrados: dos rayas
  const f2 = toHex(sq.map((r) => r.join("")));
  const puddle = (w, h) => { // charco: media elipse aplastada apoyada en la última fila, sin ojos
    const ins = (x, y) => { const r = 19 - y; if (r < 0 || r >= h) return false; return Math.abs(x + 0.5 - 8) <= (w / 2) * Math.sqrt(1 - (r / h) ** 2) + 0.3; };
    return Array.from({ length: 20 }, (_, y) => Array.from({ length: 16 }, (_, x) => (!ins(x, y) ? "." : [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !ins(x + a, y + b)) ? "o" : "g")));
  };
  const p3 = puddle(15, 4); for (const [x, y] of [[4, 14], [11, 13]]) p3[y][x] = "h";
  const p4 = puddle(12, 3).map((r) => r.map((k) => (k === "g" || k === "h" ? "G" : k))); for (const [x, y, k] of [[3, 11, "h"], [12, 10, "g"], [8, 12, "h"]]) p4[y][x] = k;
  const p5 = Array.from({ length: 20 }, () => Array(16).fill("."));
  for (let x = 5; x <= 10; x++) p5[19][x] = "G"; for (let x = 6; x <= 9; x++) p5[18][x] = "G";
  for (const [x, y, k] of [[4, 7, "h"], [11, 6, "h"], [7, 9, "g"]]) p5[y][x] = k;
  const p6 = Array.from({ length: 20 }, () => Array(16).fill("."));
  for (let x = 6; x <= 9; x++) p6[19][x] = "G";
  p6[3][7] = "h"; p6[2][10] = "g";
  const frames = [f1, f2, toHex(p3.map((r) => r.join(""))), toHex(p4.map((r) => r.join(""))), toHex(p5.map((r) => r.join(""))), toHex(p6.map((r) => r.join("")))];
  const D = [
    "Derrota, frame 1: el golpe final. El interior del slime se vuelve blanco durante un instante; el contorno y los ojos se quedan, así se sigue leyendo quién es.",
    "Frame 2: se aplasta a 14×6 y cierra los ojos (dos rayas de 2 px). Ya no es un aplastado de salto: no va a volver a subir.",
    "Frame 3: se derrama en un charco de 16×4 que ocupa todo el ancho del lienzo. Dos gotas claras saltan del charco.",
    "Frame 4: el charco encoge a 12 de ancho y se oscurece (todo en el verde oscuro). Tres burbujas suben: la materia se va hacia arriba.",
    "Frame 5: queda una mancha de 6×2 en el suelo y las burbujas siguen subiendo, más separadas.",
    "Frame 6: una mancha de 4 px en el suelo y las dos últimas burbujas arriba. Se puede dejar la mancha unos segundos o borrarla.",
  ];
  fixedFrames(frames).forEach((f, i) => add(`slime-die-${i + 1}`, D[i], ["criatura", "animación"], f.pal, f.rows));
  // error: el slime desaparece «a ruido», quitando píxeles sueltos al azar
  const rest = toHex(slimeFrame(10, 8, 19));
  const h01 = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 100 / 100;
  const noise = [0.3, 0.6, 0.85].map((t) => rest.map((r, y) => r.map((c, x) => (c && h01(x, y) >= t ? c : null))));
  const ND = [
    "Error: el slime desaparece a ruido, frame 1. Se han borrado al azar 25 de sus 66 píxeles (un 38 %): aparecen huecos sueltos dentro y en el contorno.",
    "Frame 2 del error: quedan 25 de 66 píxeles (un 62 % borrado). Quedan píxeles huérfanos por toda la forma; se ve como una señal que se corta, no como una gelatina que se deshace.",
    "Frame 3 del error: quedan 12 de 66 píxeles (un 82 % borrado). Unos pocos píxeles sueltos donde estaba el slime, sin forma ni dirección.",
  ];
  fixedFrames(noise).forEach((f, i) => add(`slime-die-noise-${i + 1}`, ND[i], ["criatura", "animación", "error"], f.pal, f.rows));
}

// ---------- autotile de camino: 16 piezas según qué vecinos son camino (N=1, E=2, S=4, O=8)
const PATHP = { g: "#3fa45b", d: "#2c7a48", l: "#6fd17f", e: "#a87a4a", E: "#8a5e38", r: "#6b4a30", p: "#c9a06a" };
function pathTile(mask, { square = false } = {}) {
  const C = 8, R = 4; // centrado: el camino ocupa las columnas 4–11 y queda igual al girarlo
  const ends = [[1, [8, -1]], [2, [17, 8]], [4, [8, 17]], [8, [-1, 8]]].filter(([b]) => mask & b).map(([, p]) => p);
  const segDist = (px, py, [ax, ay], [bx, by]) => { const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1))); return Math.hypot(px - ax - t * vx, py - ay - t * vy); };
  return Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    const px = x + 0.5, py = y + 0.5;
    let d = Math.hypot(px - C, py - C);
    for (const e of ends) d = Math.min(d, segDist(px, py, [C, C], e));
    if (square) d = mask === 0 ? 99 : 0; // error: la casilla entera de tierra, sin bordes ni formas
    const h = (x * 7 + y * 13) % 17;
    if (d <= R) return square ? (h === 0 ? "E" : "e") : d > R - 1 ? "E" : h === 0 ? "p" : h === 5 ? "E" : "e";
    if (d <= R + 1) return "r";
    const blade = (bx, by) => ((bx * 37 + by * 91) ^ (bx * by * 7)) % 41 === 0; // matas repartidas sin patrón visible
    return blade(x, y) ? "l" : blade(x, y - 1) || blade(x - 1, y - 1) ? "d" : "g";
  }).map((k) => PATHP[k]));
}
{
  const sheet = Array.from({ length: 64 }, () => Array(64).fill(null));
  for (let m = 0; m < 16; m++) { const t = pathTile(m), ox = (m % 4) * 16, oy = Math.floor(m / 4) * 16; t.forEach((r, y) => r.forEach((c, x) => { sheet[oy + y][ox + x] = c; })); }
  const s = hexGridToSprite(sheet);
  add("autotile-path", "Hoja de autotile de 64×64: las 16 piezas de un camino de tierra, una por cada combinación de vecinos. La pieza n.º (fila×4 + columna) suma 1 si hay camino arriba, 2 a la derecha, 4 abajo y 8 a la izquierda. La 0 es un trozo de camino sin salidas; la 15, un cruce. La tierra tiene un borde más oscuro, una línea de tierra húmeda contra la hierba y piedrecitas.", ["tile", "autotile"], s.pal, s.rows);
  const MASK = ["......", ".PPPP.", ".P..P.", ".P.PPP", ".PPP..", "......"]; // un lazo con una salida a la derecha y un ramal
  const isP = (x, y) => MASK[y]?.[x] === "P";
  const map = (square) => {
    const px = Array.from({ length: MASK.length * 16 }, () => Array(MASK[0].length * 16).fill(null));
    MASK.forEach((row, ty) => [...row].forEach((_, tx) => {
      const m = isP(tx, ty) ? (isP(tx, ty - 1) ? 1 : 0) | (isP(tx + 1, ty) || (tx + 1 === MASK[0].length && isP(tx, ty)) ? 2 : 0) | (isP(tx, ty + 1) ? 4 : 0) | (isP(tx - 1, ty) ? 8 : 0) : 0;
      const t = isP(tx, ty) ? pathTile(m, { square }) : pathTile(0, { square: true });
      t.forEach((r, y) => r.forEach((c, x) => { px[ty * 16 + y][tx * 16 + x] = c; }));
    }));
    return hexGridToSprite(px);
  };
  const g = map(false), b = map(true);
  add("map-path", "Mapa de 96×96 (6×6 tiles) montado con el autotile: cada casilla de camino mira a sus cuatro vecinos y elige su pieza. Sale un lazo con un ramal hacia la derecha, con curvas redondeadas y los bordes continuos de una casilla a otra.", ["tile", "autotile", "mapa"], g.pal, g.rows);
  add("map-path-bad", "Error: el mismo camino pintando cada casilla entera de tierra. Las curvas son escalones de 16 px, no hay borde entre la tierra y la hierba y se ve la rejilla.", ["tile", "autotile", "mapa", "error"], b.pal, b.rows);
}

// ---------- luz de borde (rim light): el héroe a contraluz sobre un fondo de noche (28×30)
{
  const BG = "#141a2e", BG2 = "#1d2742", MOON = "#e8f0ff", RIM = "#9fd4ff", RIM_O = "#4a6a9a";
  const W = 28, H = 30, X0 = 6, Y0 = 4;
  const scene = (mode) => {
    const px = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
      if (Math.hypot(x - 22.5, y - 6.5) <= 3.2) return MOON; // la luna, detrás y a la derecha
      return y >= 26 ? "#10141f" : (x + y * 2) % 9 === 0 && y < 20 ? BG2 : BG;
    }));
    const hero = toHexGrid("hero-chibi");
    const isFig = (x, y) => !!hero[y]?.[x];
    hero.forEach((r, y) => r.forEach((c, x) => {
      if (!c) return;
      const outline = c === "#1b1030";
      let out = mode === "none" ? c : outline ? c : shadeHex(c, 0.62); // a contraluz, la cara de delante queda en sombra
      if (mode === "rim") {
        // borde iluminado: el píxel interior que toca el contorno por la derecha o por arriba, y el contorno de ese lado se aclara
        const rightEdge = !outline && (hero[y][x + 1] === "#1b1030" && !isFig(x + 2, y));
        const topEdge = !outline && hero[y - 1]?.[x] === "#1b1030" && !isFig(x, y - 2) && x >= 8;
        if (rightEdge || topEdge) out = RIM;
        if (outline && !isFig(x + 1, y) && x >= 7) out = RIM_O;
      }
      if (mode === "halo") {
        const edge = !outline && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => hero[y + b]?.[x + a] === "#1b1030");
        if (edge) out = "#ffffff"; // error: borde blanco por todos lados
      }
      px[Y0 + y][X0 + x] = out;
    }));
    return hexGridToSprite(px);
  };
  const n = scene("none"), r = scene("rim"), h = scene("halo");
  add("rim-none", "El héroe de noche, sin luz de borde (28×30). Sus colores normales y el contorno oscuro sobre un fondo azul casi negro: el contorno se funde con el fondo y la silueta se pierde.", ["luz", "personaje"], n.pal, n.rows);
  add("rim-good", "El mismo héroe a contraluz, con la luna detrás y a la derecha. El cuerpo baja al 62 % (está de espaldas a la luz) y una línea de 1 px de azul claro recorre el borde derecho y la parte de arriba, por dentro del contorno; el contorno de ese lado se aclara. La figura se separa del fondo y se sabe de dónde viene la luz.", ["luz", "personaje"], r.pal, r.rows);
  add("rim-halo", "Error: un borde blanco de 1 px por todos lados, igual a la izquierda que a la derecha. Separa la figura, pero no viene de ninguna luz: parece una pegatina recortada.", ["luz", "personaje", "error"], h.pal, h.rows);
}

// ---------- NPCs: variar el héroe base cambiando silueta, no solo colores (16×24)
{
  const O = "#1b1030";
  const base = () => toHexGrid("hero-chibi").map((r) => r.slice());
  const recolor = (px, map) => px.map((r) => r.map((c) => (c && map[c]) || c));
  const TUNIC = (a, b) => ({ "#3b6fd1": a, "#26489a": b });
  // anciano: pelo y barba grises, túnica morada y un bastón
  const elder = recolor(base(), { ...TUNIC("#7a4a9a", "#4e2f66"), "#a0603a": "#c9d1dc", "#6b3d2e": "#8f9bab" });
  const BEARD = "#e8e8f0", BEARD_D = "#b8bcc8";
  for (const [y, x0, x1] of [[11, 4, 11], [12, 4, 11], [13, 5, 10], [14, 6, 9]]) for (let x = x0; x <= x1; x++) elder[y][x] = y === 14 || x === x0 || x === x1 ? BEARD_D : BEARD;
  elder[17] = elder[17].map((c) => (c === "#8f9bab" ? "#4e2f66" : c)); // el cinturón vuelve a ser oscuro (compartía color con el pelo)
  for (let y = 5; y <= 23; y++) elder[y][14] = y === 5 ? O : "#8a5a3c"; // bastón
  elder[4][14] = O; elder[5][13] = elder[5][13] || O; elder[5][15] = O; elder[6][15] = O; elder[4][13] = O;
  elder[5][14] = "#c98a2a"; // pomo
  // mercader: sombrero de ala ancha, túnica verde y delantal
  const merch = recolor(base(), TUNIC("#3fa45b", "#2c7a48"));
  for (let x = 1; x <= 14; x++) { merch[3][x] = x === 1 || x === 14 ? O : "#a0603a"; merch[4][x] = O; }
  for (let x = 4; x <= 11; x++) { merch[0][x] = O; merch[1][x] = x === 4 || x === 11 ? O : "#d08a50"; merch[2][x] = x === 4 || x === 11 ? O : x < 7 ? "#d08a50" : "#a0603a"; }
  merch[2][5] = "#c2413b"; merch[2][6] = "#c2413b"; // cinta
  for (let y = 17; y <= 19; y++) for (let x = 5; x <= 10; x++) merch[y][x] = y === 19 || x === 5 || x === 10 ? "#c9b8a0" : "#f4ecdc"; // delantal
  // niño: el mismo cuerpo con tres filas menos (tunica más corta y piernas más cortas), pelo rojo, túnica amarilla
  const kid0 = recolor(base(), { ...TUNIC("#f2c14e", "#c98a2a"), "#a0603a": "#e8484f", "#6b3d2e": "#c2413b" });
  kid0[17] = kid0[17].map((c) => (c === "#c2413b" ? "#8a5a3c" : c)); // cinturón marrón
  const kid = [[...Array(16)].map(() => null), [...Array(16)].map(() => null), [...Array(16)].map(() => null), ...kid0.filter((_, y) => y !== 15 && y !== 18 && y !== 20)];
  // guardia: casco, túnica roja y una lanza
  const guard = recolor(base(), TUNIC("#c2413b", "#9c2f2c"));
  toHexGrid("gear-helmet").forEach((r, y) => r.forEach((c, x) => { if (c) guard[y][x] = c; }));
  for (let y = 0; y <= 23; y++) guard[y][14] = y <= 2 ? (y === 0 ? O : "#c9d1dc") : "#6b3d2e";
  guard[1][13] = O; guard[1][15] = O; guard[2][13] = "#8f9bab"; guard[2][15] = "#8f9bab";
  const add16 = (name, d, px) => { const s = hexGridToSprite(px); add(name, d, ["personaje", "npc"], s.pal, s.rows); };
  add16("npc-elder", "Anciano a partir del héroe (16×24): pelo gris, una barba que cubre la parte de abajo de la cara y baja hasta el cuello de la túnica, túnica morada y un bastón con pomo dorado a su derecha. La barba cambia la mancha de valor de la cara; el bastón, la silueta.", elder);
  add16("npc-merchant", "Mercader a partir del héroe (16×24): sombrero de ala ancha de 14 px con una copa de 8 y dos píxeles rojos de cinta, túnica verde y un delantal crema. La silueta cambia arriba: el sombrero hace plana y ancha la parte de arriba de la cabeza.", merch);
  add16("npc-kid", "Niño a partir del héroe (16×24): la misma cabeza con el cuerpo tres filas más corto (18 px de alto en total, frente a los 21 del héroe), pelo rojo y túnica amarilla. Misma cabeza, otra proporción: se lee más joven.", kid);
  add16("npc-guard", "Guardia a partir del héroe (16×24): el casco del equipo modular de P5-07, túnica roja y una lanza que sobresale por encima de la cabeza. La silueta acaba en punta.", guard);
  const lineup = (list) => { const px = Array.from({ length: 24 }, () => Array(70).fill(null)); list.forEach((g, i) => g.forEach((r, y) => r.forEach((c, x) => { if (c) px[y][i * 18 + x] = c; }))); return hexGridToSprite(px); };
  const g = lineup([elder, merch, kid, guard]);
  add("npc-lineup", "Los cuatro NPCs en fila (70×24): anciano, mercader, niño y guardia. Comparten cabeza y estilo, pero cada uno tiene una silueta propia: barba y bastón, sombrero ancho, cuerpo corto, lanza y casco.", ["personaje", "npc"], g.pal, g.rows);
  const clones = [TUNIC("#7a4a9a", "#4e2f66"), TUNIC("#3fa45b", "#2c7a48"), TUNIC("#f2c14e", "#c98a2a"), TUNIC("#c2413b", "#9c2f2c")].map((m) => recolor(base(), m));
  const b = lineup(clones);
  add("npc-lineup-bad", "Error: cuatro NPCs hechos solo cambiando el color de la túnica del héroe (morado, verde, amarillo y rojo). En silueta son idénticos: parecen el mismo personaje cuatro veces.", ["personaje", "npc", "error"], b.pal, b.rows);
}

// ---------- objeto que se recoge: flota sobre su sombra, brilla y desaparece al cogerlo (16×20)
{
  const W = 16, H = 20, SH = "#1f4f34";
  const potion = toHexGrid("potion"); // 10×12
  const frame = (dy, shadowW, { sparkle = null, flash = false, burst = 0 } = {}) => {
    const px = Array.from({ length: H }, () => Array(W).fill(null));
    if (shadowW) { // sombra: una elipse oscura de 2 filas (la de arriba, 2 px más estrecha)
      for (let x = 8 - shadowW / 2; x < 8 + shadowW / 2; x++) px[18][x] = SH;
      for (let x = 8 - shadowW / 2 + 1; x < 8 + shadowW / 2 - 1; x++) px[17][x] = SH;
    }
    if (!burst) potion.forEach((r, y) => r.forEach((c, x) => { if (c) px[4 + dy + y][3 + x] = flash && c !== "#1b1030" ? "#ffffff" : c; }));
    if (sparkle) { const [sx, sy] = sparkle; px[sy][sx] = "#ffffff"; px[sy - 1][sx] = "#ffe58a"; px[sy + 1][sx] = "#ffe58a"; px[sy][sx - 1] = "#ffe58a"; px[sy][sx + 1] = "#ffe58a"; }
    if (burst) {
      const r = burst; // anillo de destellos que se abre
      for (let a = 0; a < 8; a++) { const x = Math.round(8 + Math.cos((a * Math.PI) / 4) * r), y = Math.round(9 + Math.sin((a * Math.PI) / 4) * r); if (px[y]?.[x] !== undefined) px[y][x] = a % 2 ? "#ffe58a" : "#ffffff"; }
    }
    return px;
  };
  const idle = [frame(0, 8), frame(-1, 6, { sparkle: [12, 5] }), frame(-2, 6), frame(-1, 6)];
  const ID = [
    "Objeto para recoger, frame 1: la poción de 10×12 en lo más bajo de su vuelo, con su sombra debajo, una elipse verde oscura de 8 px (2 filas), separada del frasco por 1 fila vacía. No toca el suelo: flota.",
    "Frame 2: la poción sube 1 px y la sombra encoge a 6. Un destello en cruz aparece arriba a la derecha del frasco.",
    "Frame 3: lo más alto, 2 px por encima del frame 1, con la sombra de 6.",
    "Frame 4: baja 1 px, de vuelta hacia el frame 1. El bucle 1-2-3-4 sube y baja con suavidad.",
  ];
  fixedFrames(idle).forEach((f, i) => add(`pickup-${i + 1}`, ID[i], ["objeto", "animación"], f.pal, f.rows));
  const get = [frame(-4, 4, { flash: true }), frame(0, 0, { burst: 3 }), frame(0, 0, { burst: 6 })];
  const GD = [
    "Recogida, frame 1: la poción salta 4 px hacia arriba y se vuelve blanca por dentro (el contorno se queda). La sombra encoge a 4.",
    "Recogida, frame 2: la poción ya no está; en su lugar, un anillo de 8 destellos (blancos y amarillos) de radio 3.",
    "Recogida, frame 3: el anillo se abre a radio 6 y se acaba. Después, nada: el objeto se ha recogido.",
  ];
  fixedFrames(get).forEach((f, i) => add(`pickup-get-${i + 1}`, GD[i], ["objeto", "animación"], f.pal, f.rows));
  // en escena: sobre hierba, junto a una seta y una roca del mismo tamaño
  const scene = (good) => {
    const px = Array.from({ length: 32 }, (_, y) => Array.from({ length: 48 }, (_, x) => { const k = grassTile().rows[y % 16][x % 16]; return GRASS[k]; }));
    stamp(px, "mushroom8", 4, 18); stamp(px, "rock-clean", 36, 18);
    if (good) { const f = frame(-2, 6, { sparkle: [12, 5] }); f.forEach((r, y) => r.forEach((c, x) => { if (c && px[y + 6]?.[x + 16] !== undefined) px[y + 6][x + 16] = c; })); }
    else potion.forEach((r, y) => r.forEach((c, x) => { if (c) px[14 + y][19 + x] = c; })); // apoyada en el suelo, sin sombra ni brillo
    return hexGridToSprite(px);
  };
  const sg = scene(true), sb = scene(false);
  add("pickup-scene", "La poción como objeto para recoger en la hierba (48×32), entre una seta y una roca: flota con 3 filas de aire entre el frasco y su sombra, y tiene un destello. Se distingue del decorado: eso se puede coger.", ["objeto", "escena"], sg.pal, sg.rows);
  add("pickup-scene-bad", "Error: la misma poción apoyada en la hierba, sin sombra, sin flotar y sin destello, entre la seta y la roca. Parece un elemento más del decorado.", ["objeto", "escena", "error"], sb.pal, sb.rows);
}

// ---------- tres valores: la escena final reducida a oscuro / medio / claro, y una escena «embarrada» sin contraste
{
  const sf = spriteByName("scene-final");
  const grid = sf.rows.map((r) => [...r].map((k) => (k === "." ? null : sf.palette[k])));
  const three = (px) => px.map((r) => r.map((c) => (c === null ? null : lum(c) < 85 ? "#2a2a33" : lum(c) < 170 ? "#7a7a86" : "#d6d6de")));
  const muddy = grid.map((r) => r.map((c) => (c === null ? null : hexOf(mix(rgbOf(c), [122, 122, 134], 0.55)))));
  const a = hexGridToSprite(three(grid)), m = hexGridToSprite(muddy), m3 = hexGridToSprite(three(muddy));
  add("values-3", "La escena final de P8-01 reducida a tres valores (80×48): cada color pasa a oscuro, medio o claro según su luminancia (cortes en 85 y 170 sobre 255). Se ve qué zonas se separan solo por valor.", ["valor", "escena"], a.pal, a.rows);
  add("values-muddy", "Error: la misma escena con todos los colores mezclados al 55 % con un gris medio. Los tonos siguen ahí, pero los oscuros se aclaran y los claros se apagan: todo queda en valores medios.", ["valor", "escena", "error"], m.pal, m.rows);
  add("values-muddy-3", "La escena «embarrada» reducida a los mismos tres valores: casi todo cae en el valor medio. Sin oscuros ni claros, nada se separa.", ["valor", "escena", "error"], m3.pal, m3.rows);
}

// ---------- escribir y validar
let bad = 0;
for (const s of out) {
  const e = validateSprite(s, s.name);
  if (e.length) { bad++; console.error(e.join("\n")); continue; }
  writeFileSync(`art-src/sprites/${s.name}.sprite.json`, JSON.stringify(s, null, 2) + "\n");
}
console.log(`${out.length - bad} sprites didácticos escritos en art-src/sprites/`);
if (bad) process.exit(1);
