// Convierte las lecciones visibles en el «catálogo» ligero que necesita el navegador
// para calcular tu progreso (se incrusta como JSON en cada página).
import { visibleLessons } from "./lessons";
import { url } from "./url";
import type { CatalogLesson } from "./game/core";

export async function buildCatalog(): Promise<CatalogLesson[]> {
  return (await visibleLessons()).map((l) => ({
    id: l.data.id,
    discipline: l.data.discipline,
    level: l.data.level,
    order: l.data.order,
    title: l.data.title,
    href: url(`${l.data.discipline}/${l.data.id}/`),
    duration: l.data.duration,
    piece: l.data.piece.name,
    prerequisites: l.data.prerequisites,
    xp: l.data.xp,
  }));
}
