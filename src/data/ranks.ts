// Rangos por disciplina y rango global. `min` = XP necesaria.
// Con el MVP (~9 lecciones de ~90 XP) se llega al segundo rango de cada ruta;
// los rangos altos exigen avanzar de verdad en el currículo.
import type { Rank } from "../lib/game/core";

export const RANKS: Record<"pixel" | "voxel" | "fundamentos" | "global", Rank[]> = {
  pixel: [
    { name: "Aprendiz de píxel", min: 0 },
    { name: "Oficial de píxel", min: 250 },
    { name: "Artesano del píxel", min: 900 },
    { name: "Maestro píxel", min: 2200 },
  ],
  voxel: [
    { name: "Aprendiz de cantero", min: 0 },
    { name: "Cantero", min: 250 },
    { name: "Constructor", min: 900 },
    { name: "Arquitecto voxel", min: 2200 },
  ],
  fundamentos: [
    { name: "Observador", min: 0 },
    { name: "Estudiante de arte", min: 150 },
    { name: "Ojo entrenado", min: 500 },
    { name: "Director de arte", min: 1200 },
  ],
  global: [
    { name: "Aprendiz", min: 0 },
    { name: "Oficial", min: 500 },
    { name: "Artesano", min: 1800 },
    { name: "Maestro forjador", min: 4500 },
  ],
};
