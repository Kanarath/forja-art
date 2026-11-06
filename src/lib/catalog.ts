// Convierte las lecciones visibles y los encargos en el «catálogo» ligero que necesita
// el navegador para calcular tu progreso (se incrusta como JSON en cada página).
import { getCollection } from "astro:content";
import { visibleLessons } from "./lessons";
import { url } from "./url";
import type { Catalog } from "./game/core";

let cache: Promise<Catalog> | undefined;

export function buildCatalog(): Promise<Catalog> {
  cache ??= (async () => ({
    lessons: (await visibleLessons()).map((l) => ({
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
      achievements: l.data.achievements,
    })),
    commissions: (await getCollection("commissions"))
      .map((c) => ({ id: c.data.id, title: c.data.title, discipline: c.data.discipline, count: c.data.count, xp: c.data.xp, href: url(`logros/#${c.data.id}`) }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  }))();
  return cache;
}
