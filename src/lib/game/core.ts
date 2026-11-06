// LÓGICA PURA DE PROGRESO: recibe datos y devuelve resultados. No toca el navegador,
// así que se puede probar con tests (tests/core.test.ts).
//
// Principio: solo se GUARDA lo que hiciste (qué bloques completaste). La XP, el rango,
// los porcentajes y la siguiente lección se CALCULAN siempre a partir de eso.

export type DisciplineId = "pixel" | "voxel" | "fundamentos";
export type Part = "concept" | "guided" | "piece";
export const PARTS: Part[] = ["concept", "guided", "piece"];

/** Lo que el navegador necesita saber de cada lección (lo genera el build). */
export interface CatalogLesson {
  id: string;
  discipline: DisciplineId;
  level: number;
  order: number;
  title: string;
  href: string;
  duration: number;
  piece: string;
  prerequisites: string[];
  xp: Record<Part, number>;
}

/** Lo único que se guarda. */
export interface ProgressState {
  version: 1;
  lessons: Record<string, { parts: Partial<Record<Part, string>>; checks?: number[] }>; // fecha ISO de cada parte
}

export const emptyState = (): ProgressState => ({ version: 1, lessons: {} });

export interface Rank { name: string; min: number }

export function lessonXp(l: CatalogLesson, s: ProgressState): number {
  const done = s.lessons[l.id]?.parts ?? {};
  return PARTS.reduce((sum, p) => sum + (done[p] ? l.xp[p] : 0), 0);
}

export const isComplete = (l: CatalogLesson, s: ProgressState) => PARTS.every((p) => !!s.lessons[l.id]?.parts[p]);
export const isStarted = (l: CatalogLesson, s: ProgressState) => PARTS.some((p) => !!s.lessons[l.id]?.parts[p]);

export function xpBy(catalog: CatalogLesson[], s: ProgressState) {
  const out: Record<DisciplineId | "total", number> = { pixel: 0, voxel: 0, fundamentos: 0, total: 0 };
  for (const l of catalog) {
    const x = lessonXp(l, s);
    out[l.discipline] += x;
    out.total += x;
  }
  return out;
}

/** Rango actual y siguiente para una cantidad de XP (los rangos van de menor a mayor). */
export function rankFor(xp: number, ranks: Rank[]) {
  let i = 0;
  while (i + 1 < ranks.length && xp >= ranks[i + 1].min) i++;
  return { current: ranks[i], next: ranks[i + 1] as Rank | undefined };
}

/** Estadísticas de una disciplina: % de XP posible conseguida y último nivel completado. */
export function disciplineStats(catalog: CatalogLesson[], s: ProgressState, d: DisciplineId, levels: number[]) {
  const list = catalog.filter((l) => l.discipline === d);
  const possible = list.reduce((a, l) => a + PARTS.reduce((b, p) => b + l.xp[p], 0), 0);
  const earned = list.reduce((a, l) => a + lessonXp(l, s), 0);
  // un nivel cuenta como completado si tiene lecciones y todas están completas,
  // y también lo están todos los niveles anteriores
  let levelDone = levels[0] - 1;
  for (const n of levels) {
    const inLevel = list.filter((l) => l.level === n);
    if (inLevel.length === 0 || !inLevel.every((l) => isComplete(l, s))) break;
    levelDone = n;
  }
  return {
    percent: possible ? Math.round((earned / possible) * 100) : 0,
    levelDone,
    lessonsDone: list.filter((l) => isComplete(l, s)).length,
    lessonsTotal: list.length,
  };
}

const prereqsMet = (l: CatalogLesson, catalog: CatalogLesson[], s: ProgressState) =>
  l.prerequisites.every((id) => {
    const p = catalog.find((x) => x.id === id);
    return !p || isComplete(p, s); // un prerrequisito que aún no está publicado no bloquea
  });

/**
 * Siguiente lección recomendada. Sigue la ruta guiada (`route`, ids en orden) y elige la
 * primera lección sin completar cuyos prerrequisitos estén hechos. Las lecciones empezadas
 * tienen prioridad: si dejaste algo a medias, te lo recuerda primero.
 */
export function nextLesson(catalog: CatalogLesson[], s: ProgressState, route: string[], discipline?: DisciplineId) {
  const pool = catalog.filter((l) => !discipline || l.discipline === discipline);
  const ordered = [
    ...route.map((id) => pool.find((l) => l.id === id)).filter((l): l is CatalogLesson => !!l),
    ...pool.filter((l) => !route.includes(l.id)).sort((a, b) => a.level - b.level || a.order - b.order),
  ];
  const pending = ordered.filter((l) => !isComplete(l, s));
  return pending.find((l) => isStarted(l, s)) ?? pending.find((l) => prereqsMet(l, catalog, s)) ?? pending[0];
}

/** Valida y migra lo que haya en el almacenamiento: si está corrupto, empieza de cero. */
export function parseState(raw: string | null): ProgressState {
  if (!raw) return emptyState();
  try {
    const s = JSON.parse(raw);
    if (s?.version !== 1 || typeof s.lessons !== "object" || s.lessons === null) return emptyState();
    return s as ProgressState;
  } catch {
    return emptyState();
  }
}
