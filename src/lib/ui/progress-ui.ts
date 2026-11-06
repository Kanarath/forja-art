// Pinta tu progreso en la página. El HTML se genera sin conocer tus datos (están en tu
// navegador), así que al cargar leemos el progreso y actualizamos los elementos marcados
// con atributos data-*. Se vuelve a ejecutar cada vez que el progreso cambia.
//
//   data-xp="total|pixel|voxel|fundamentos"   → XP
//   data-rank="global|pixel|voxel|fundamentos"→ nombre del rango
//   data-xpbar="global|…"                     → barra segmentada (XpBar)
//   data-pct="pixel|…"                        → porcentaje de la disciplina
//   data-levels="pixel|…" + hijos [data-n]    → tiras y mapas de niveles
//   data-lesson-item="p0-01"                  → una lección en una lista
//   data-next="global|pixel|…"                → tarjeta «siguiente lección»
//   data-ach="id" · data-ach-count            → logros (paleta y lista)
//   data-commission="id" + [data-commission-count] → encargos
import { xpBy, rankFor, disciplineStats, nextLesson, isComplete, isStarted, unlockedAchievements, commissionPieces, isCommissionDone, type Catalog, type DisciplineId, type ProgressState } from "../game/core";
import { ACHIEVEMENTS } from "../../data/achievements";
import { toast } from "./toast";
import { onProgress } from "../store/progress";
import { RANKS } from "../../data/ranks";
import { ROUTE } from "../../data/route";
import { DISCIPLINES } from "../../data/disciplines";

const cat: Catalog = { lessons: [], commissions: [], ...JSON.parse(document.getElementById("forja-catalog")?.textContent || "{}") };
const catalog = cat.lessons;
const SEEN_KEY = "forja-art:achievements-seen";
const LEVELS = Object.fromEntries(DISCIPLINES.map((d) => [d.id, d.levels.map((l) => l.n)])) as Record<DisciplineId, number[]>;
const NAMES = Object.fromEntries(DISCIPLINES.map((d) => [d.id, d.name])) as Record<DisciplineId, string>;
const $$ = <T extends Element = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];
const scopeRanks = (scope: string) => RANKS[(scope === "total" ? "global" : scope) as keyof typeof RANKS];

function render(s: ProgressState) {
  const xp = xpBy(catalog, s, cat.commissions);

  for (const el of $$("[data-xp]")) el.textContent = String(xp[el.dataset.xp as keyof typeof xp] ?? 0);
  for (const el of $$("[data-rank]")) {
    const scope = el.dataset.rank!;
    el.textContent = rankFor(xp[scope === "global" ? "total" : (scope as DisciplineId)], scopeRanks(scope)).current.name;
  }

  for (const bar of $$("[data-xpbar]")) {
    const scope = bar.dataset.xpbar!;
    const value = xp[scope === "global" ? "total" : (scope as DisciplineId)];
    const { current, next } = rankFor(value, scopeRanks(scope));
    const span = next ? next.min - current.min : 1;
    const frac = next ? (value - current.min) / span : 1;
    const segs = bar.querySelectorAll("i");
    segs.forEach((seg, i) => seg.classList.toggle("on", i < Math.round(frac * segs.length)));
    const label = bar.querySelector("[data-xpbar-label]");
    if (label) label.textContent = next ? `${value} / ${next.min} XP → ${next.name}` : `${value} XP · rango máximo`;
    bar.setAttribute("aria-valuenow", String(value));
    bar.setAttribute("aria-valuemax", String(next?.min ?? value));
  }

  for (const d of Object.keys(LEVELS) as DisciplineId[]) {
    const st = disciplineStats(catalog, s, d, LEVELS[d]);
    for (const el of $$(`[data-pct="${d}"]`)) el.textContent = `${st.percent}%`;
    for (const list of $$(`[data-levels="${d}"]`))
      for (const li of list.querySelectorAll<HTMLElement>(":scope > [data-n]")) {
        const n = Number(li.dataset.n);
        const state = n <= st.levelDone ? "done" : n === st.levelDone + 1 ? "now" : "todo";
        li.classList.remove("done", "now", "todo");
        li.classList.add(state);
        const label = li.querySelector("[data-state]");
        if (label) label.textContent = state === "done" ? "Completado" : state === "now" ? "Siguiente" : "Pendiente";
      }
  }

  for (const el of $$("[data-lesson-item]")) {
    const l = catalog.find((x) => x.id === el.dataset.lessonItem);
    if (!l) continue;
    el.classList.toggle("is-done", isComplete(l, s));
    el.classList.toggle("is-started", !isComplete(l, s) && isStarted(l, s));
  }

  for (const card of $$("[data-next]")) {
    const scope = card.dataset.next!;
    const l = nextLesson(catalog, s, ROUTE, scope === "global" ? undefined : (scope as DisciplineId));
    card.classList.toggle("is-empty", !l);
    if (!l) continue;
    const set = (sel: string, text: string) => card.querySelectorAll(sel).forEach((e) => (e.textContent = text));
    set("[data-next-id]", l.id.toUpperCase());
    set("[data-next-title]", l.title);
    set("[data-next-meta]", `${NAMES[l.discipline]} · nivel ${l.level} · ~${l.duration} min`);
    set("[data-next-piece]", l.piece);
    card.querySelectorAll<HTMLAnchorElement>("a[data-next-link]").forEach((a) => (a.href = l.href));
    card.dataset.discipline = l.discipline;
  }
}

function renderCommissions(s: ProgressState) {
  for (const el of $$("[data-commission]")) {
    const c = cat.commissions.find((x) => x.id === el.dataset.commission);
    if (!c) continue;
    const n = Math.min(commissionPieces(c, s), c.count);
    el.classList.toggle("is-done", isCommissionDone(c, s));
    el.querySelectorAll("[data-commission-count]").forEach((e) => (e.textContent = `${n}/${c.count}`));
    el.querySelectorAll<HTMLElement>("[data-commission-bar]").forEach((e) => (e.style.width = `${(n / c.count) * 100}%`));
  }
}

function renderAchievements(s: ProgressState) {
  const got = unlockedAchievements(ACHIEVEMENTS, s, cat);
  for (const el of $$("[data-ach]")) {
    const on = got.has(el.dataset.ach!);
    el.classList.toggle("got", on);
    const def = ACHIEVEMENTS.find((a) => a.id === el.dataset.ach);
    if (def) el.title = on ? `${def.name} ✓` : `${def.name} (pendiente): ${def.description}`;
  }
  for (const el of $$("[data-ach-count]")) el.textContent = `${got.size}/${ACHIEVEMENTS.length}`;

  // aviso solo para logros NUEVOS: los ya vistos se recuerdan para no repetirlo
  let seen: string[] | null = null;
  try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "null"); } catch { /* sin almacenamiento */ }
  const fresh = seen ? [...got].filter((id) => !seen!.includes(id)) : [];
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...got])); } catch { /* sin almacenamiento */ }
  for (const id of fresh) {
    const a = ACHIEVEMENTS.find((x) => x.id === id)!;
    toast({ kicker: "¡Logro desbloqueado!", title: a.name, text: a.description, color: a.color });
  }
}

onProgress((s) => {
  render(s);
  renderAchievements(s);
  renderCommissions(s);
});
