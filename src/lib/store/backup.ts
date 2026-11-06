// Copia de seguridad completa: portfolio (piezas + imágenes) y progreso, en un .zip.
//   manifest.json      → versión, fecha, progreso y metadatos de las piezas
//   images/<id>.<ext>  → cada imagen tal cual
import { createZip, readZip, textEntry, entryText, type ZipEntry } from "../zip";
import { listPieces, getImage, clearPortfolio, putAll, type Piece, type StoredImage } from "./portfolio";
import { loadProgress } from "./progress";
import { parseState } from "../game/core";

const EXT: Record<string, string> = { "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/jpeg": "jpg" };
const TYPE = Object.fromEntries(Object.entries(EXT).map(([t, e]) => [e, t]));
const LAST_KEY = "forja-art:last-backup";
const PROGRESS_KEY = "forja-art:progress";

interface Manifest { app: "forja-art"; version: 1; exportedAt: string; progress: unknown; pieces: Piece[] }

export async function exportBackup(): Promise<{ blob: Blob; filename: string; count: number }> {
  const pieces = await listPieces();
  const entries: ZipEntry[] = [];
  for (const p of pieces)
    for (const v of p.versions) {
      const img = await getImage(v.imageId);
      if (!img) continue;
      entries.push({ name: `images/${img.id}.${EXT[img.type] ?? "bin"}`, data: new Uint8Array(await img.blob.arrayBuffer()) });
    }
  const manifest: Manifest = { app: "forja-art", version: 1, exportedAt: new Date().toISOString(), progress: loadProgress(), pieces };
  const zip = createZip([textEntry("manifest.json", JSON.stringify(manifest, null, 2)), ...entries]);
  try { localStorage.setItem(LAST_KEY, manifest.exportedAt); } catch { /* sin almacenamiento */ }
  const date = manifest.exportedAt.slice(0, 10);
  return { blob: new Blob([zip], { type: "application/zip" }), filename: `forja-art-copia-${date}.zip`, count: pieces.length };
}

/** Lee y comprueba una copia SIN aplicar nada: devuelve un resumen para confirmar. */
export async function inspectBackup(file: Blob) {
  const entries = readZip(new Uint8Array(await file.arrayBuffer()));
  const m = entries.find((e) => e.name === "manifest.json");
  if (!m) throw new Error("Falta manifest.json: no es una copia de FORJA//ART");
  const manifest = JSON.parse(entryText(m)) as Manifest;
  if (manifest.app !== "forja-art" || manifest.version !== 1) throw new Error("Esta copia no es de FORJA//ART o es de una versión que no conozco");
  const images: StoredImage[] = entries
    .filter((e) => e.name.startsWith("images/"))
    .map((e) => {
      const [id, ext] = e.name.slice(7).split(".");
      const type = TYPE[ext] ?? "application/octet-stream";
      return { id, type, blob: new Blob([e.data], { type }) };
    });
  const missing = manifest.pieces.flatMap((p) => p.versions).filter((v) => !images.some((i) => i.id === v.imageId)).length;
  return { manifest, images, summary: { pieces: manifest.pieces.length, images: images.length, missing, exportedAt: manifest.exportedAt } };
}

/** Sustituye el portfolio y el progreso actuales por los de la copia. */
export async function applyBackup(data: Awaited<ReturnType<typeof inspectBackup>>) {
  await clearPortfolio();
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(parseState(JSON.stringify(data.manifest.progress))));
  } catch { /* sin almacenamiento */ }
  await putAll(data.manifest.pieces, data.images); // también recalcula el resumen del portfolio
  window.dispatchEvent(new CustomEvent("forja:progress"));
}

export function lastBackup(): string | null {
  try { return localStorage.getItem(LAST_KEY); } catch { return null; }
}

/** Descarga un Blob como archivo. */
export function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
