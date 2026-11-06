// Registro de sprites que las lecciones pueden citar por nombre: <Sprite name="gem" />.
// Todos son datos (paleta + filas). Al añadir un ejemplo nuevo, regístralo aquí.
import { gem, potion, sword, chest, slime, type SpriteData } from "./demo-art";

export const SPRITES: Record<string, SpriteData> = { gem, potion, sword, chest, slime };

export function getSprite(name: string): SpriteData {
  const s = SPRITES[name];
  if (!s) throw new Error(`Sprite «${name}» no está registrado en src/data/sprites.ts`);
  return s;
}
