import { useQuery } from "@tanstack/react-query";
import type { Question, Topic } from "./types";

// The content pipeline (tools/build_index.py) writes these into public/ at build time.
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function useQuestions() {
  return useQuery({
    queryKey: ["questions"],
    queryFn: () => fetchJson<Question[]>(`${import.meta.env.BASE_URL}questions.json`),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchJson<Topic[]>(`${import.meta.env.BASE_URL}topics.json`),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
