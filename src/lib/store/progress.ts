// Almacenamiento del progreso en el navegador (localStorage).
// - Si el almacenamiento está bloqueado (modo privado, permisos), la web sigue funcionando
//   sin guardar: nunca rompe la página.
// - Cada cambio emite el evento "forja:progress" para que la interfaz se actualice,
//   también entre pestañas abiertas (evento "storage").
import { parseState, type Part, type ProgressState } from "../game/core";

const KEY = "forja-art:progress";
export const PROGRESS_EVENT = "forja:progress";

export function loadProgress(): ProgressState {
  try {
    return parseState(localStorage.getItem(KEY));
  } catch {
    return parseState(null);
  }
}

function save(s: ProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sin almacenamiento: el progreso dura lo que dure la página */
  }
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: s }));
}

export function setPart(lessonId: string, part: Part, done: boolean) {
  const s = loadProgress();
  const l = (s.lessons[lessonId] ??= { parts: {} });
  if (done) l.parts[part] = new Date().toISOString();
  else delete l.parts[part];
  save(s);
}

export function setChecks(lessonId: string, checks: number[]) {
  const s = loadProgress();
  (s.lessons[lessonId] ??= { parts: {} }).checks = checks;
  save(s);
}

/** Llama a `fn` ahora y cada vez que cambie el progreso (en esta pestaña o en otra). */
export function onProgress(fn: (s: ProgressState) => void) {
  fn(loadProgress());
  window.addEventListener(PROGRESS_EVENT, () => fn(loadProgress()));
  window.addEventListener("storage", (e) => e.key === KEY && fn(loadProgress()));
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* nada que borrar */ }
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}
