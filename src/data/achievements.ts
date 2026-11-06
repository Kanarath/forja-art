// Logros de habilidad: representan algo que HAS HECHO, no clics.
// - Sin `rules`: los desbloquea la pieza de una lección que lo declare en su frontmatter
//   (achievements: [id]). El build comprueba que el id exista aquí.
// - Con `rules`: se desbloquean cuando se cumplen todas (ver Rule en src/lib/game/core.ts).
// El color es la «muestra» que se pinta en la paleta de logros.
import type { AchievementDef } from "../lib/game/core";

export const ACHIEVEMENTS: AchievementDef[] = [
  // --- generales (portfolio y encargos)
  { id: "primera-pieza", name: "Primera pieza forjada", description: "Registra tu primera pieza en el portfolio.", color: "#e6c35c", rules: [{ type: "pieces", count: 1 }] },
  { id: "iterar", name: "Iterar es forjar", description: "Guarda 3 versiones de una misma pieza.", color: "#ffd36e", rules: [{ type: "versions", count: 3 }] },
  { id: "doble-forja", name: "Doble forja", description: "Ten al menos una pieza de pixel y otra de voxel.", color: "#c58cff", rules: [{ type: "pieces", count: 1, discipline: "pixel" }, { type: "pieces", count: 1, discipline: "voxel" }] },
  { id: "primer-encargo", name: "Encargo cumplido", description: "Completa tu primer encargo.", color: "#ff8f5a", rules: [{ type: "commissions", count: 1 }] },
  // --- de lección (se desbloquean con la pieza de la lección que los declara)
  { id: "taller-listo", name: "Taller listo", description: "Configura Aseprite y exporta tu primer sprite nítido (P0-01).", color: "#ffb84d" },
  { id: "primera-silueta", name: "Primera silueta", description: "Un objeto que se lee a 1×, sin zoom (P1-01).", color: "#ff4fa3" },
  { id: "primer-render", name: "Primer render", description: "Tu primer modelo renderizado en MagicaVoxel (V0-01).", color: "#38e1ff" },
  { id: "valor-3", name: "Valor en 3 tonos", description: "Una pieza que se lee en escala de grises (F01).", color: "#cfcfcf" },
  { id: "linea-limpia", name: "Línea limpia", description: "Líneas pixel-perfect sin jaggies (P2-01).", color: "#ff6fb8" },
  { id: "prop-coherente", name: "Prop coherente", description: "Un prop voxel con escala y paleta coherentes.", color: "#2ec4a6" },
  { id: "clusters-limpios", name: "Clusters limpios", description: "Un sprite sombreado con grupos de color limpios, sin ruido (P2-02).", color: "#b9b4cc" },
  { id: "selout", name: "Contorno con intención", description: "Un sprite con selout y antialiasing selectivo (P2-03).", color: "#e8789a" },
  { id: "luz-con-direccion", name: "Luz con dirección", description: "Sombreado con una sola fuente de luz, sin pillow shading (P3-01).", color: "#ffe58a" },
  { id: "rampa-hue", name: "Rampa con hue shifting", description: "Una rampa propia con las sombras frías y las luces cálidas (P3-02).", color: "#ffb84d" },
  { id: "dither-justo", name: "Dithering justo", description: "Un dithering que se lee como un tono a 1× y no como ruido (P3-03).", color: "#8f7bff" },
  { id: "materiales", name: "Cuatro materiales", description: "Metal, madera, piedra y cristal que se distinguen por cómo responden a la luz (P4-01).", color: "#c9d1dc" },
  { id: "set-iconos", name: "Set de iconos", description: "Ocho iconos de inventario con la misma escala, luz y paleta (P4-02).", color: "#f2c14e" },
  { id: "brillo-animado", name: "Brillo animado", description: "Una microanimación de brillo en bucle (P4-03).", color: "#fff3c4" },
  { id: "rampa-3d", name: "Rampa en 3D", description: "Un modelo voxel con rampa de valor y hue shifting en su paleta (V3-01).", color: "#b4ab9f" },
  { id: "material-render", name: "Metal, cristal y luz", description: "Un render con materiales Metal, Glass y Emit (V3-02).", color: "#9fd8ff" },
  { id: "temperatura", name: "Temperatura de color", description: "Una pieza con luces cálidas y sombras frías en las dos disciplinas (F03).", color: "#ff8f5a" },
  { id: "luz-dos-mundos", name: "Una luz, dos mundos", description: "El mismo objeto iluminado desde la misma dirección en pixel y en voxel (F05).", color: "#ffe58a" },
  { id: "forma-primero", name: "Forma antes que detalle", description: "Un modelo voxel con su blockout guardado como primera versión (V2-01).", color: "#38e1ff" },
];
