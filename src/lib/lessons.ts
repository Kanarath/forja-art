// Acceso a las lecciones + comprobaciones que necesitan ver TODAS las lecciones a la vez.
// Si algo no cuadra, lanza un error y el build se detiene con un mensaje claro.
import { getCollection, type CollectionEntry } from "astro:content";
import { DISCIPLINES, type DisciplineId } from "../data/disciplines";
import { ACHIEVEMENTS } from "../data/achievements";

export type Lesson = CollectionEntry<"lessons">;

/** Qué estados se muestran: en local todos; en producción, revisadas («en prueba») y publicadas. */
const VISIBLE_IN_PROD = new Set(["revisada", "publicada"]);

let cache: Promise<Lesson[]> | undefined;

export function allLessons(): Promise<Lesson[]> {
  cache ??= getCollection("lessons").then((list) => {
    validate(list);
    return list.sort((a, b) => a.data.level - b.data.level || a.data.order - b.data.order);
  });
  return cache;
}

/** Lecciones visibles en el entorno actual. */
export async function visibleLessons(): Promise<Lesson[]> {
  const list = await allLessons();
  return import.meta.env.PROD ? list.filter((l) => VISIBLE_IN_PROD.has(l.data.status)) : list;
}

export async function lessonsOf(discipline: DisciplineId) {
  return (await visibleLessons()).filter((l) => l.data.discipline === discipline);
}

export const lessonXp = (l: Lesson) => l.data.xp.concept + l.data.xp.guided + l.data.xp.piece;

function validate(list: Lesson[]) {
  const errors: string[] = [];
  const ids = new Map<string, string>();

  for (const l of list) {
    const { id, discipline, level, prerequisites, fundamentals } = l.data;
    const where = `src/content/lessons/${l.id}.mdx`;

    if (ids.has(id)) errors.push(`${where}: id «${id}» repetido (también en ${ids.get(id)})`);
    ids.set(id, where);

    // el número del id debe coincidir con el nivel: p1-02 → nivel 1
    const idLevel = Number(id.slice(1).split("-")[0]);
    if (idLevel !== level) errors.push(`${where}: el id «${id}» indica nivel ${idLevel} pero level es ${level}`);

    // el nivel debe existir en el registro de la disciplina
    const d = DISCIPLINES.find((x) => x.id === discipline)!;
    if (!d.levels.some((x) => x.n === level)) errors.push(`${where}: ${d.name} no tiene nivel ${level}`);

    // los logros citados deben existir en src/data/achievements.ts
    for (const a of l.data.achievements)
      if (!ACHIEVEMENTS.some((x) => x.id === a)) errors.push(`${where}: logro «${a}» no existe en src/data/achievements.ts`);

    // los fundamentos citados (f01, f02…) deben existir
    for (const f of fundamentals) {
      const n = Number(f.replace(/^f/, ""));
      if (!/^f\d{2}$/.test(f) || !DISCIPLINES.find((x) => x.id === "fundamentos")!.levels.some((x) => x.n === n))
        errors.push(`${where}: fundamento «${f}» no existe (usa f01…f10)`);
    }
  }

  // los prerrequisitos deben ser lecciones existentes
  for (const l of list)
    for (const p of l.data.prerequisites)
      if (!ids.has(p)) errors.push(`src/content/lessons/${l.id}.mdx: prerrequisito «${p}» no existe`);

  if (errors.length) throw new Error(`\n\nContenido no válido:\n  - ${errors.join("\n  - ")}\n`);
}
