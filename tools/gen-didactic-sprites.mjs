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

// ---------- escribir y validar
let bad = 0;
for (const s of out) {
  const e = validateSprite(s, s.name);
  if (e.length) { bad++; console.error(e.join("\n")); continue; }
  writeFileSync(`art-src/sprites/${s.name}.sprite.json`, JSON.stringify(s, null, 2) + "\n");
}
console.log(`${out.length - bad} sprites didácticos escritos en art-src/sprites/`);
if (bad) process.exit(1);
