// Progreso de EJEMPLO para ver la interfaz con datos (hasta la tarea 1.7).
// En la 1.7 esto se sustituye por el progreso real guardado en tu navegador.
export const DEMO = {
  rank: "Aprendiz",
  nextRank: "Oficial",
  xp: 340,
  xpNext: 500,
  current: { id: "p1-02", title: "Siluetas de objetos", discipline: "pixel" as const, minutes: 40, tool: "Aseprite", pitch: "una poción que se lee a 1×", piece: "sprite de 16×16" },
  levelDone: { pixel: 0, voxel: 0, fundamentos: 1 } as Record<string, number>, // último nivel completado (-1 = ninguno)
  percent: { pixel: 18, voxel: 9, fundamentos: 10 } as Record<string, number>,
};

export const ACHIEVEMENTS = [
  { id: "primera-silueta", name: "Primera silueta", color: "#ff4fa3", got: true },
  { id: "rampa-hue", name: "Rampa con hue shifting", color: "#ffb84d", got: true },
  { id: "primer-render", name: "Primer render", color: "#38e1ff", got: true },
  { id: "prop-coherente", name: "Prop coherente", color: "#2ec4a6", got: false },
  { id: "valor-3", name: "Valor en 3 tonos", color: "#e6c35c", got: true },
  { id: "ciclo-4", name: "Ciclo de 4 frames", color: "#8f7bff", got: false },
  { id: "tileset", name: "Tileset sin costuras", color: "#4ade80", got: false },
  { id: "diorama", name: "Primer diorama", color: "#ff6b4a", got: false },
];
