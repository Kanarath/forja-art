// Publica la web en GitHub Pages SIN GitHub Actions.
//
// Construye en tu ordenador y sube el resultado (dist/) a la rama `gh-pages`.
// En el repo, Pages está configurado como «Deploy from a branch: gh-pages / (root)».
// GitHub solo copia esos archivos ya hechos (el .nojekyll evita que intente compilarlos).
//
//   npm run deploy            → solo las lecciones revisadas o publicadas (como en producción)
//   npm run deploy -- --drafts → incluye también los borradores
//
// Antes de subir nada pasa `npm run check`: si falla, no se publica.
import { execSync } from "node:child_process";
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const drafts = process.argv.includes("--drafts");
const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });
const out = (cmd, opts = {}) => execSync(cmd, { encoding: "utf8", ...opts }).trim();

const remote = out("git remote get-url origin");
const commit = out("git rev-parse --short HEAD");
if (out("git status --porcelain")) console.warn("Aviso: hay cambios sin commit; se publica lo que hay en disco.");

run("npm run check");
run("npm run build", { env: { ...process.env, ...(drafts ? { FORJA_INCLUDE_DRAFTS: "1" } : {}) } });

const dist = "dist";
writeFileSync(join(dist, ".nojekyll"), ""); // sin esto, GitHub intentaría pasar la web por Jekyll
if (existsSync(join(dist, ".git"))) rmSync(join(dist, ".git"), { recursive: true, force: true });

// un repo de usar y tirar dentro de dist/: un solo commit con la web, que sustituye a la rama gh-pages
const g = (cmd) => run(`git ${cmd}`, { cwd: dist });
g("init -q -b gh-pages");
g("add -A");
g(`-c user.name="FORJA deploy" -c user.email="deploy@forja.local" commit -q -m "Publicar ${commit}${drafts ? " (con borradores)" : ""}"`);
g(`push -q --force ${remote} gh-pages`);
rmSync(join(dist, ".git"), { recursive: true, force: true });

console.log(`\n✔ Subido a gh-pages (${commit}${drafts ? ", con borradores" : ""}). GitHub tarda 1–2 minutos en servirlo en https://kanarath.github.io/forja-art/`);
