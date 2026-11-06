// Registro de sprites: carga TODOS los archivos art-src/sprites/*.sprite.json en el build.
// Las lecciones los citan por nombre: <Sprite name="gem" />.
// Para añadir un sprite basta con crear su .sprite.json: no hay que tocar código.
import { validateSprite } from "../lib/pixel/sprite.mjs";
import type { SpriteFile } from "../lib/pixel/sprite.d.mts";

export type { SpriteData, SpriteFile } from "../lib/pixel/sprite.d.mts";

// import.meta.glob (Vite) importa todos los archivos que coinciden, al compilar.
const files = import.meta.glob<SpriteFile>("/art-src/sprites/*.sprite.json", { eager: true, import: "default" });

const errors: string[] = [];
export const SPRITES: Record<string, SpriteFile> = {};
for (const [path, s] of Object.entries(files)) {
  const file = path.replace(/^\//, "");
  errors.push(...validateSprite(s, file));
  const expected = path.split("/").pop()!.replace(".sprite.json", "");
  if (s.name !== expected) errors.push(`${file}: «name» es «${s.name}» pero el archivo se llama «${expected}»`);
  SPRITES[s.name] = s;
}
if (errors.length) throw new Error(`\n\nSprites no válidos:\n  - ${errors.join("\n  - ")}\n`);

export function getSprite(name: string): SpriteFile {
  const s = SPRITES[name];
  if (!s) throw new Error(`Sprite «${name}» no existe: crea art-src/sprites/${name}.sprite.json`);
  return s;
}
