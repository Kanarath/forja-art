// Genera los .vox de los modelos didácticos (art-src/vox/models.mjs) en public/assets/vox/.
//   node tools/build-vox.mjs
// Cada etapa es un archivo: barril_1.vox, barril_2.vox… Se pueden abrir en MagicaVoxel.
// También escribe models.json con las etiquetas y notas de cada etapa para el visor.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { MODELS, hollowOut } from "../art-src/vox/models.mjs";
import { writeVox, readVox } from "../src/lib/voxel/vox.mjs";

const OUT = "public/assets/vox";
rmSync(OUT, { recursive: true, force: true }); // derivados: se regeneran siempre
mkdirSync(OUT, { recursive: true });

const index = {};
let files = 0;
for (const [name, m] of Object.entries(MODELS)) {
  index[name] = { description: m.description, stages: [] };
  m.stages.forEach((s, i) => {
    const file = `${name}_${i + 1}.vox`;
    const data = writeVox(hollowOut(s.voxels));
    const back = readVox(data); // comprobación de ida y vuelta
    if (!back.voxels.length) throw new Error(`${file}: el modelo ha salido vacío`);
    writeFileSync(join(OUT, file), data);
    index[name].stages.push({ file, label: s.label, note: s.note, size: back.size, voxels: back.voxels.length });
    files++;
  });
}
writeFileSync(join(OUT, "models.json"), JSON.stringify(index, null, 2));
console.log(`Vox: ${Object.keys(MODELS).length} modelos → ${files} archivos .vox en ${OUT}/`);
