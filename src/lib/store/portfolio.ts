// Portfolio en IndexedDB (la base de datos del navegador).
// Dos «almacenes»:
//   pieces → metadatos de cada pieza (nombre, disciplina, técnicas, lecciones, versiones…)
//   images → los archivos de imagen (Blob), uno por versión
// Separarlos permite listar piezas rápido sin cargar todas las imágenes.
import { setPortfolioSummary } from "./progress";

export type Discipline = "pixel" | "voxel" | "fundamentos";

export interface Version { imageId: string; date: string; note: string; width?: number; height?: number }
export interface Piece {
  id: string;
  name: string;
  discipline: Discipline;
  description: string;
  techniques: string[];
  tools: string[];
  lessons: string[]; // ids de lección relacionadas (p0-01…)
  commission?: string; // id del encargo al que pertenece (c-botica…)
  notes: string;
  createdAt: string;
  updatedAt: string;
  versions: Version[]; // de la más antigua a la más reciente
}
export interface StoredImage { id: string; blob: Blob; type: string }

export const PORTFOLIO_EVENT = "forja:portfolio";
const DB_NAME = "forja-art";
const DB_VERSION = 1;

let dbp: Promise<IDBDatabase> | undefined;
function db(): Promise<IDBDatabase> {
  dbp ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    // se ejecuta la primera vez (o al subir DB_VERSION): crea los almacenes
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains("pieces")) d.createObjectStore("pieces", { keyPath: "id" });
      if (!d.objectStoreNames.contains("images")) d.createObjectStore("images", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("No se pudo abrir el almacenamiento del navegador"));
  });
  return dbp;
}

/** Ejecuta una operación en una transacción y devuelve su resultado como promesa. */
async function tx<T>(stores: string[], mode: IDBTransactionMode, fn: (t: IDBTransaction) => IDBRequest<T> | void): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction(stores, mode);
    const req = fn(t);
    t.oncomplete = () => resolve(req ? req.result : (undefined as T));
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error ?? new Error("Operación cancelada (¿sin espacio?)"));
  });
}

const notify = () => window.dispatchEvent(new CustomEvent(PORTFOLIO_EVENT));
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export async function listPieces(): Promise<Piece[]> {
  const all = await tx<Piece[]>(["pieces"], "readonly", (t) => t.objectStore("pieces").getAll());
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export const getPiece = (id: string) => tx<Piece | undefined>(["pieces"], "readonly", (t) => t.objectStore("pieces").get(id));
export const getImage = (id: string) => tx<StoredImage | undefined>(["images"], "readonly", (t) => t.objectStore("images").get(id));

/** Lee el tamaño real (en píxeles) de una imagen. */
export async function imageSize(blob: Blob): Promise<{ width: number; height: number } | undefined> {
  try {
    const bmp = await createImageBitmap(blob);
    const s = { width: bmp.width, height: bmp.height };
    bmp.close();
    return s;
  } catch {
    return undefined;
  }
}

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/gif", "image/webp", "image/jpeg"];

function checkImage(file: Blob) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Formato no admitido: usa PNG, GIF, WebP o JPG (mejor PNG para pixel art)");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("La imagen pesa más de 8 MB");
}

/** Guarda una pieza nueva con su primera versión. */
export async function createPiece(data: Omit<Piece, "id" | "createdAt" | "updatedAt" | "versions">, image: Blob, note = "Primera versión"): Promise<Piece> {
  checkImage(image);
  const now = new Date().toISOString();
  const imageId = newId("img");
  const size = await imageSize(image);
  const piece: Piece = { ...data, id: newId("pz"), createdAt: now, updatedAt: now, versions: [{ imageId, date: now, note, ...size }] };
  await tx(["pieces", "images"], "readwrite", (t) => {
    t.objectStore("images").put({ id: imageId, blob: image, type: image.type } satisfies StoredImage);
    t.objectStore("pieces").put(piece);
  });
  await syncProgress(); // registrar la pieza completa la parte «pieza» de su lección
  notify();
  return piece;
}

/** Añade una versión nueva (una imagen más reciente) a una pieza existente. */
export async function addVersion(pieceId: string, image: Blob, note: string): Promise<Piece> {
  checkImage(image);
  const piece = await getPiece(pieceId);
  if (!piece) throw new Error("La pieza no existe");
  const now = new Date().toISOString();
  const imageId = newId("img");
  piece.versions.push({ imageId, date: now, note, ...(await imageSize(image)) });
  piece.updatedAt = now;
  await tx(["pieces", "images"], "readwrite", (t) => {
    t.objectStore("images").put({ id: imageId, blob: image, type: image.type } satisfies StoredImage);
    t.objectStore("pieces").put(piece);
  });
  await syncProgress();
  notify();
  return piece;
}

export async function updatePiece(piece: Piece): Promise<void> {
  piece.updatedAt = new Date().toISOString();
  await tx(["pieces"], "readwrite", (t) => { t.objectStore("pieces").put(piece); });
  await syncProgress();
  notify();
}

/** Borra una pieza y sus imágenes. Si una lección se queda sin pieza, pierde la XP de la pieza. */
export async function deletePiece(id: string): Promise<void> {
  const piece = await getPiece(id);
  if (!piece) return;
  await tx(["pieces", "images"], "readwrite", (t) => {
    for (const v of piece.versions) t.objectStore("images").delete(v.imageId);
    t.objectStore("pieces").delete(id);
  });
  await syncProgress(piece.lessons);
  notify();
}

/**
 * Escribe en el progreso el resumen del portfolio:
 * - la parte «pieza» de una lección está hecha si y solo si hay alguna pieza asociada a ella;
 * - cuántas piezas hay por disciplina y por encargo, y el máximo de versiones (para los logros).
 * `candidates`: lecciones que podrían haberse quedado sin pieza (al borrar).
 */
export async function syncProgress(candidates: string[] = []) {
  const pieces = await listPieces();
  const summary = {
    pieces: { pixel: 0, voxel: 0, fundamentos: 0 },
    maxVersions: 0,
    commissions: {} as Record<string, number>,
  };
  for (const p of pieces) {
    summary.pieces[p.discipline]++;
    summary.maxVersions = Math.max(summary.maxVersions, p.versions.length);
    if (p.commission) summary.commissions[p.commission] = (summary.commissions[p.commission] ?? 0) + 1;
  }
  setPortfolioSummary(summary, new Set(pieces.flatMap((p) => p.lessons)), candidates);
}

/** Borra todo el portfolio (se usa al importar una copia). */
export async function clearPortfolio() {
  await tx(["pieces", "images"], "readwrite", (t) => { t.objectStore("pieces").clear(); t.objectStore("images").clear(); });
}

/** Guarda tal cual piezas e imágenes (desde una copia de seguridad). */
export async function putAll(pieces: Piece[], images: StoredImage[]) {
  await tx(["pieces", "images"], "readwrite", (t) => {
    for (const i of images) t.objectStore("images").put(i);
    for (const p of pieces) t.objectStore("pieces").put(p);
  });
  await syncProgress();
  notify();
}

export function onPortfolio(fn: () => void) {
  fn();
  window.addEventListener(PORTFOLIO_EVENT, fn);
}
