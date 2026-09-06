import type { User } from "@supabase/supabase-js";
import {
  type QProgress,
  clearLocalProgress,
  getAllProgress,
  replaceLocalProgress,
} from "./progress";
import { supabase } from "./supabase";

const OWNER_KEY = "quantprep.progress.owner";

interface ProgressRow {
  user_id: string;
  question_id: string;
  status: QProgress["status"];
  favorite: boolean;
  reps: number;
  interval_days: number;
  ease: number;
  due_at: string | null;
  updated_at: string;
}

function toRow(userId: string, progress: QProgress): ProgressRow {
  return {
    user_id: userId,
    question_id: progress.id,
    status: progress.status,
    favorite: progress.favorite,
    reps: progress.reps,
    interval_days: progress.intervalDays,
    ease: progress.ease,
    due_at: progress.dueAt ? new Date(progress.dueAt).toISOString() : null,
    updated_at: new Date(progress.updatedAt).toISOString(),
  };
}

function fromRow(row: ProgressRow): QProgress {
  return {
    id: row.question_id,
    status: row.status,
    favorite: row.favorite,
    reps: row.reps,
    intervalDays: row.interval_days,
    ease: row.ease,
    dueAt: row.due_at ? Date.parse(row.due_at) : null,
    updatedAt: Date.parse(row.updated_at),
  };
}

export async function pushProgress(userId: string, progress: QProgress): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("question_progress")
    .upsert(toRow(userId, progress), { onConflict: "user_id,question_id" });
  if (error) throw error;
}

export async function syncAllProgress(user: User): Promise<void> {
  if (!supabase) return;

  const previousOwner = localStorage.getItem(OWNER_KEY);
  if (previousOwner && previousOwner !== user.id) {
    await clearLocalProgress();
  }
  localStorage.setItem(OWNER_KEY, user.id);

  const local = await getAllProgress();
  const { data, error } = await supabase.from("question_progress").select("*");
  if (error) throw error;

  const remote = new Map(
    ((data ?? []) as ProgressRow[]).map((row) => [row.question_id, fromRow(row)]),
  );
  const uploads: ProgressRow[] = [];
  const ids = new Set([...Object.keys(local), ...remote.keys()]);

  for (const id of ids) {
    const localRecord = local[id];
    const remoteRecord = remote.get(id);

    if (remoteRecord && (!localRecord || remoteRecord.updatedAt > localRecord.updatedAt)) {
      await replaceLocalProgress(remoteRecord);
    } else if (localRecord && (!remoteRecord || localRecord.updatedAt >= remoteRecord.updatedAt)) {
      uploads.push(toRow(user.id, localRecord));
    }
  }

  if (uploads.length > 0) {
    const { error: uploadError } = await supabase
      .from("question_progress")
      .upsert(uploads, { onConflict: "user_id,question_id" });
    if (uploadError) throw uploadError;
  }
}

export async function clearProgressSession(): Promise<void> {
  localStorage.removeItem(OWNER_KEY);
  await clearLocalProgress();
}
