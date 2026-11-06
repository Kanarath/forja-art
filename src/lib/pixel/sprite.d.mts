// Tipos para sprite.mjs (para que TypeScript entienda el módulo JavaScript).
export interface SpriteData {
  palette: Record<string, string>;
  rows: string[];
}
export interface SpriteFile extends SpriteData {
  name: string;
  description: string;
  license: string;
  tags?: string[];
}
export declare const TRANSPARENT: ".";
export declare function validateSprite(s: unknown, file?: string): string[];
export declare function spriteToRGBA(s: SpriteData): { width: number; height: number; data: Uint8Array };
