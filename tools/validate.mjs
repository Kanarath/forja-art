// VALIDADOR DE FORJA//ART — npm run validate
// Comprueba lo que el build normal no ve. Sale con código 1 si hay errores (así CI no publica).
//
// 1. Contenido: que cada lección tenga sus 6 bloques (aviso en borrador, error si está revisada/publicada).
// 2. Compila la web INCLUYENDO los borradores en .validate-dist/ (un error de MDX en un borrador
//    no se vería en el build normal, que se los salta).
// 3. Sobre la web generada:
//    - enlaces y recursos internos que no existen (/forja-art/…)
//    - imágenes sin texto alternativo
//    - presupuestos de tamaño (PRD): imagen ≤ 300 KB, página ≤ 1,5 MB, JS ≤ 150 KB por página
//      (las páginas con laboratorios —atributo data-lab— tienen 600 KB de JS).
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { parseHTML } from "linkedom";

const OUT = ".validate-dist";
const BASE = "/forja-art/";
const KB = 1024;
const BUDGET = { image: 300 * KB, vox: 200 * KB, page: 1536 * KB, js: 150 * KB, jsLab: 600 * KB };
const BLOCKS = ["pieza", "concepto", "guiada", "version", "errores", "calidad"];

const errors = [];
const warnings = [];
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const kb = (n) => `${(n / KB).toFixed(1)} KB`;

// ---------- 1. contenido
console.log("1/3 · Revisando el contenido de las lecciones…");
for (const file of walk("src/content/lessons").filter((f) => f.endsWith(".mdx"))) {
  const src = readFileSync(file, "utf8");
  const status = /^status:\s*(\w+)/m.exec(src)?.[1] ?? "?";
  const missing = BLOCKS.filter((b) => !new RegExp(`<Block\\s+kind=["']${b}["']`).test(src));
  if (missing.length) {
    const msg = `${file}: faltan bloques ${missing.join(", ")}`;
    (status === "borrador" ? warnings : errors).push(status === "borrador" ? `${msg} (es un borrador)` : msg);
  }
  if (/!\[\]\(/.test(src)) errors.push(`${file}: imagen Markdown sin texto alternativo (![](…))`);
}

// ---------- 2. build con borradores
console.log("2/3 · Compilando la web con TODOS los borradores…");
// ejecutable de Astro según su package.json (funciona igual en Windows, macOS y Linux)
const astroPkg = JSON.parse(readFileSync(join("node_modules", "astro", "package.json"), "utf8"));
const astro = join("node_modules", "astro", typeof astroPkg.bin === "string" ? astroPkg.bin : astroPkg.bin.astro);
const build = spawnSync(process.execPath, [astro, "build"], {
  env: { ...process.env, FORJA_INCLUDE_DRAFTS: "1", FORJA_OUT_DIR: `./${OUT}` },
  encoding: "utf8",
});
if (build.status !== 0) {
  console.error(build.stdout?.slice(-3000), build.stderr?.slice(-3000));
  errors.push("El build con borradores ha fallado (detalles arriba)");
  report();
}

// ---------- 3. web generada
console.log("3/3 · Revisando enlaces, imágenes y tamaños…");
const files = walk(OUT);
const size = (p) => statSync(p).size;
const resolve = (url) => {
  // /forja-art/pixel/ → .validate-dist/pixel/index.html ; /forja-art/x.png → .validate-dist/x.png
  const path = decodeURI(url.split(/[?#]/)[0]).slice(BASE.length);
  const candidates = [join(OUT, path), join(OUT, path, "index.html"), join(OUT, `${path}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
};

for (const f of files) {
  const ext = extname(f).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext) && size(f) > BUDGET.image) errors.push(`${f}: imagen de ${kb(size(f))} (máx. ${kb(BUDGET.image)})`);
  if (ext === ".vox" && size(f) > BUDGET.vox) errors.push(`${f}: modelo .vox de ${kb(size(f))} (máx. ${kb(BUDGET.vox)})`);
}

const pages = files.filter((f) => f.endsWith(".html"));
const rows = [];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const name = "/" + relative(OUT, page).replace(/\\/g, "/").replace(/index\.html$/, "");
  // enlaces y recursos internos
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]).filter((u) => u.startsWith(BASE));
  for (const u of new Set(refs)) if (!resolve(u)) errors.push(`${name}: enlace o recurso roto → ${u}`);
  // enlaces internos sin la base (romperían en GitHub Pages)
  for (const m of html.matchAll(/\shref="(\/(?!forja-art\/|\/)[^"]*)"/g)) errors.push(`${name}: enlace sin la base /forja-art/ → ${m[1]}`);
  // imágenes sin alt (alt="" está permitido para imágenes decorativas)
  for (const m of html.matchAll(/<img\b(?![^>]*\salt=)[^>]*>/g)) errors.push(`${name}: <img> sin atributo alt → ${m[0].slice(0, 80)}`);
  if (!name.startsWith("/maquetas/")) a11y(name, html); // las maquetas son referencia archivada
  // peso de la página: HTML + CSS + JS + imágenes que referencia
  let js = 0, total = size(page);
  for (const u of new Set(refs)) {
    const p = resolve(u);
    if (!p || p.endsWith(".html")) continue;
    if (/\.(m?js)$/.test(p)) js += size(p);
    // los módulos JS pueden importar otros: los sumamos también
    total += size(p);
  }
  for (const m of html.matchAll(/import\s*["'](\/forja-art\/[^"']+\.js)["']/g)) {
    const p = resolve(m[1]);
    if (p) { js += size(p); total += size(p); }
  }
  const jsBudget = html.includes("data-lab") ? BUDGET.jsLab : BUDGET.js;
  if (js > jsBudget) errors.push(`${name}: ${kb(js)} de JavaScript (máx. ${kb(jsBudget)})`);
  if (total > BUDGET.page) errors.push(`${name}: la página pesa ${kb(total)} (máx. ${kb(BUDGET.page)})`);
  rows.push({ name, html: size(page), js, total });
}

rows.sort((a, b) => b.total - a.total);
console.log("\nPáginas más pesadas:");
for (const r of rows.slice(0, 5)) console.log(`  ${r.name.padEnd(28)} HTML ${kb(r.html).padStart(9)} · JS ${kb(r.js).padStart(9)} · total ${kb(r.total).padStart(9)}`);
console.log(`\n${pages.length} páginas revisadas (incluidos borradores).`);
report();

/**
 * Accesibilidad básica sobre el HTML generado (lo que se puede comprobar sin navegador):
 * idioma, un único h1, títulos sin saltos de nivel, y nombre accesible en botones,
 * enlaces y campos de formulario. Los elementos que crea JavaScript no se ven aquí.
 */
function a11y(name, html) {
  const { document } = parseHTML(html);
  const text = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();
  const named = (el) => text(el) || el.getAttribute("aria-label") || el.getAttribute("title") || el.querySelector("img[alt]:not([alt=''])") || el.querySelector("svg[aria-label]");
  const short = (el) => el.outerHTML.replace(/\s+/g, " ").slice(0, 90);

  if (!document.documentElement.getAttribute("lang")) errors.push(`${name}: <html> sin atributo lang`);
  const h1 = document.querySelectorAll("h1").length;
  if (h1 !== 1) (h1 === 0 ? errors : warnings).push(`${name}: ${h1} elementos <h1> (debe haber exactamente uno)`);
  let prev = 1;
  for (const h of document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")) {
    const lvl = Number(h.tagName[1]);
    if (lvl > prev + 1) warnings.push(`${name}: salto de título h${prev} → h${lvl} («${text(h).slice(0, 40)}»)`);
    prev = lvl;
  }
  for (const b of document.querySelectorAll("button")) if (!named(b)) errors.push(`${name}: botón sin nombre accesible → ${short(b)}`);
  for (const a of document.querySelectorAll("a[href]")) if (!named(a)) errors.push(`${name}: enlace sin texto → ${short(a)}`);
  for (const f of document.querySelectorAll("input, select, textarea")) {
    if (f.getAttribute("type") === "hidden" || f.hasAttribute("hidden")) continue;
    const id = f.getAttribute("id");
    const labelled = f.getAttribute("aria-label") || f.getAttribute("aria-labelledby") || f.closest("label") || (id && document.querySelector(`label[for="${id}"]`));
    if (!labelled) errors.push(`${name}: campo sin etiqueta → ${short(f)}`);
  }
}

function report() {
  if (warnings.length) console.log(`\n⚠ Avisos (${warnings.length}):\n  - ${warnings.join("\n  - ")}`);
  if (errors.length) {
    console.error(`\n✖ Errores (${errors.length}):\n  - ${errors.join("\n  - ")}\n`);
    process.exit(1);
  }
  console.log("\n✔ Validación correcta");
  process.exit(0);
}
