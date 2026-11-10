// Prepara las descargas de las Forge Tools en public/forge-tools/ (carpeta derivada, no se versiona):
//   · forja-vox.mjs                 la CLI para .vox, tal cual (un solo archivo)
//   · forja-aseprite-scripts.zip    los tres scripts de Aseprite
//   · demo-*.png                    hojas renderizadas con la CLI a partir de los modelos del curso
// Se ejecuta con `npm run assets`, después de build-vox (necesita public/assets/vox/).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { createZip } from "../src/lib/zip.ts";
import { parseVox, render } from "../forge-tools/vox/forja-vox.mjs";

const OUT = "public/forge-tools";
mkdirSync(OUT, { recursive: true });

copyFileSync("forge-tools/vox/forja-vox.mjs", join(OUT, "forja-vox.mjs"));

const ASE = "forge-tools/aseprite";
const scripts = readdirSync(ASE).filter((f) => f.endsWith(".lua"));
writeFileSync(join(OUT, "forja-aseprite-scripts.zip"), createZip(scripts.map((f) => ({ name: f, data: new Uint8Array(readFileSync(join(ASE, f))) }))));

const vox = (n) => parseVox(readFileSync(`public/assets/vox/${n}.vox`));
const demos = [
  ["demo-salto", ["slime-salto_1", "slime-salto_2", "slime-salto_3", "slime-salto_4"].map(vox), { size: 4, outline: true }],
  ["demo-cofre-giro", [vox("cofre_4")], { size: 6, angles: 4, outline: true }],
  ["demo-pocion", [vox("pocion_3")], { size: 8, angles: 4 }],
];
for (const [name, models, opts] of demos) writeFileSync(join(OUT, `${name}.png`), render(models, opts).png);

console.log(`Forge Tools: CLI, ${scripts.length} scripts de Aseprite y ${demos.length} demos → ${OUT}/`);
