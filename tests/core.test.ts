// Tests de la lógica de progreso. Ejecuta: npm test
// Usa el ejecutor de tests que Node trae incluido (node:test); no hace falta instalar nada.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyState, lessonXp, xpBy, rankFor, disciplineStats, nextLesson, parseState,
  type CatalogLesson, type ProgressState,
} from "../src/lib/game/core.ts";

const L = (id: string, discipline: CatalogLesson["discipline"], level: number, order: number, prerequisites: string[] = []): CatalogLesson => ({
  id, discipline, level, order, prerequisites, title: id, href: `/${id}/`, duration: 30, piece: "x",
  xp: { concept: 10, guided: 20, piece: 60 },
});
const catalog = [L("p0-01", "pixel", 0, 1), L("p1-01", "pixel", 1, 1, ["p0-01"]), L("v0-01", "voxel", 0, 1), L("f01-01", "fundamentos", 1, 1)];
const done = (s: ProgressState, id: string, parts = ["concept", "guided", "piece"]) => {
  s.lessons[id] = { parts: Object.fromEntries(parts.map((p) => [p, "2026-11-06"])) };
  return s;
};

test("la XP de una lección suma solo las partes hechas", () => {
  const s = done(emptyState(), "p0-01", ["concept", "guided"]);
  assert.equal(lessonXp(catalog[0], s), 30);
  done(s, "p0-01");
  assert.equal(lessonXp(catalog[0], s), 90);
});

test("la XP se agrupa por disciplina y en total", () => {
  const s = done(done(emptyState(), "p0-01"), "v0-01", ["concept"]);
  assert.deepEqual(xpBy(catalog, s), { pixel: 90, voxel: 10, fundamentos: 0, total: 100 });
});

test("el rango cambia justo al alcanzar el mínimo", () => {
  const ranks = [{ name: "A", min: 0 }, { name: "B", min: 100 }, { name: "C", min: 300 }];
  assert.equal(rankFor(99, ranks).current.name, "A");
  assert.equal(rankFor(100, ranks).current.name, "B");
  assert.equal(rankFor(100, ranks).next?.name, "C");
  assert.equal(rankFor(5000, ranks).next, undefined);
});

test("un nivel solo cuenta como completado si todas sus lecciones lo están", () => {
  const s = emptyState();
  assert.equal(disciplineStats(catalog, s, "pixel", [0, 1, 2]).levelDone, -1);
  done(s, "p0-01");
  const st = disciplineStats(catalog, s, "pixel", [0, 1, 2]);
  assert.equal(st.levelDone, 0);
  assert.equal(st.percent, 50);
  assert.equal(st.lessonsDone, 1);
});

test("la siguiente lección sigue la ruta y respeta los prerrequisitos", () => {
  const route = ["p0-01", "v0-01", "p1-01"];
  const s = emptyState();
  assert.equal(nextLesson(catalog, s, route)?.id, "p0-01");
  done(s, "p0-01");
  assert.equal(nextLesson(catalog, s, route)?.id, "v0-01");
  assert.equal(nextLesson(catalog, s, route, "pixel")?.id, "p1-01");
});

test("una lección empezada tiene prioridad sobre la siguiente de la ruta", () => {
  const s = done(emptyState(), "f01-01", ["concept"]);
  assert.equal(nextLesson(catalog, s, ["p0-01", "v0-01"])?.id, "f01-01");
});

test("sin lecciones pendientes no hay siguiente", () => {
  let s = emptyState();
  for (const l of catalog) s = done(s, l.id);
  assert.equal(nextLesson(catalog, s, []), undefined);
});

test("un almacenamiento corrupto o de otra versión empieza de cero", () => {
  assert.deepEqual(parseState(null), emptyState());
  assert.deepEqual(parseState("{no es json"), emptyState());
  assert.deepEqual(parseState('{"version":9,"lessons":{}}'), emptyState());
  assert.equal(Object.keys(parseState('{"version":1,"lessons":{"p0-01":{"parts":{}}}}').lessons)[0], "p0-01");
});
