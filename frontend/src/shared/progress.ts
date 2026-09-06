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

async function put(p: QProgress): Promise<void> {
  await tx("readwrite", (s) => s.put({ ...p, updatedAt: Date.now() }));
}

export async function toggleFavorite(id: string): Promise<QProgress> {
  const p = await getProgress(id);
  const next = { ...p, favorite: !p.favorite };
  await put(next);
  return next;
}

export async function setStatus(id: string, status: QStatus): Promise<QProgress> {
  const p = await getProgress(id);
  const next = { ...p, status };
  await put(next);
  return next;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Grade the recall quality (0=again, 3=good, 5=easy) and reschedule (SM-2 lite).
export async function review(id: string, quality: 0 | 3 | 5): Promise<QProgress> {
  const p = await getProgress(id);
  let { reps, intervalDays, ease } = p;

  if (quality < 3) {
    reps = 0;
    intervalDays = 1;
  } else {
    reps += 1;
    intervalDays = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(intervalDays * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  const next: QProgress = {
    ...p,
    reps,
    intervalDays,
    ease,
    status: "solved",
    dueAt: Date.now() + intervalDays * DAY_MS,
  };
  await put(next);
  return next;
}
