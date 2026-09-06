// Minimal IndexedDB wrapper for on-device progress. No backend required.
// Stores per-question state (status + favorite + spaced-repetition schedule).

export type QStatus = "unseen" | "attempted" | "solved";

export interface QProgress {
  id: string;
  status: QStatus;
  favorite: boolean;
  updatedAt: number;
  // Lightweight SM-2-style spaced repetition.
  reps: number;
  intervalDays: number;
  ease: number;
  dueAt: number | null;
}

const DB_NAME = "quantprep";
const STORE = "progress";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

function defaults(id: string): QProgress {
  return {
    id,
    status: "unseen",
    favorite: false,
    updatedAt: Date.now(),
    reps: 0,
    intervalDays: 0,
    ease: 2.5,
    dueAt: null,
  };
}

export async function getAllProgress(): Promise<Record<string, QProgress>> {
  const rows = await tx<QProgress[]>("readonly", (s) => s.getAll());
  const map: Record<string, QProgress> = {};
  for (const r of rows) {
    map[r.id] = r;
  }
  return map;
}

export async function getProgress(id: string): Promise<QProgress> {
  const row = await tx<QProgress | undefined>("readonly", (s) => s.get(id));
  return row ?? defaults(id);
}

async function put(p: QProgress): Promise<QProgress> {
  const next = { ...p, updatedAt: Date.now() };
  await tx("readwrite", (s) => s.put(next));
  return next;
}

export async function replaceLocalProgress(progress: QProgress): Promise<void> {
  await tx("readwrite", (store) => store.put(progress));
}

export async function clearLocalProgress(): Promise<void> {
  await tx("readwrite", (store) => store.clear());
}

export async function toggleFavorite(id: string): Promise<QProgress> {
  const p = await getProgress(id);
  const next = { ...p, favorite: !p.favorite };
  return put(next);
}

export async function setStatus(id: string, status: QStatus): Promise<QProgress> {
  const p = await getProgress(id);
  const next = { ...p, status };
  return put(next);
}
