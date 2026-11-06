// Rampas de color (JavaScript puro). Una RAMPA es la secuencia de tonos de un material,
// de la sombra más oscura a la luz más clara.
//
// HUE SHIFTING: en vez de solo oscurecer y aclarar, se desplaza el TONO: las luces hacia
// los cálidos (amarillo, 60°) y las sombras hacia los fríos (azul-violeta, 250°). Así la
// rampa parece iluminada por luz real y no «manchada de negro y blanco».

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function hexToHsl(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToHex({ h, s, l }) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return "#" + [f(0), f(8), f(4)].map((v) => clamp(v, 0, 255).toString(16).padStart(2, "0")).join("");
}

/** Mueve el tono `h` hacia `target` por el camino más corto, una fracción `amount` (0–1). */
function towards(h, target, amount) {
  let d = ((target - h + 540) % 360) - 180;
  return (h + d * amount + 360) % 360;
}

/**
 * @param {string} base   color medio de la rampa (#rrggbb)
 * @param {number} steps  número de tonos (3–8)
 * @param {number} hueShift  0–1: cuánto se desplaza el tono en los extremos
 * @param {number} spread    0–1: cuánta diferencia de luminosidad hay entre extremos
 * @returns {string[]} de oscuro a claro
 */
export function buildRamp(base, steps = 5, hueShift = 0.35, spread = 0.7) {
  const b = hexToHsl(base);
  const out = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1) - 0.5; // −0,5 (sombra) … +0,5 (luz)
    const l = clamp(b.l + t * spread, 0.04, 0.96);
    const h = t < 0 ? towards(b.h, 250, -t * 2 * hueShift) : towards(b.h, 60, t * 2 * hueShift);
    const s = clamp(b.s * (1 - Math.abs(t) * 0.5 * (t > 0 ? 1.2 : 0.6)), 0, 1); // los extremos pierden algo de saturación
    out.push(hslToHex({ h, s, l }));
  }
  return out;
}

/** Paleta en formato GIMP (.gpl), que Aseprite y Pixelorama importan. */
export function toGpl(colors, name = "FORJA//ART") {
  const lines = colors.map((c, i) => {
    const n = parseInt(c.slice(1), 16);
    return `${String((n >> 16) & 255).padStart(3)} ${String((n >> 8) & 255).padStart(3)} ${String(n & 255).padStart(3)}\t${name} ${i + 1}`;
  });
  return `GIMP Palette\nName: ${name}\nColumns: ${colors.length}\n#\n${lines.join("\n")}\n`;
}

/** Paleta en formato .hex (un color por línea, sin #), el que usa Lospec. */
export const toHex = (colors) => colors.map((c) => c.slice(1)).join("\n") + "\n";
