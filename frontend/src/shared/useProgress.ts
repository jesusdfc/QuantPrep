import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type QStatus, getAllProgress, review, setStatus, toggleFavorite } from "./progress";

const KEY = ["progress"];

export function useProgress() {
  return useQuery({
    queryKey: KEY,
    queryFn: getAllProgress,
    staleTime: 0,
  });
}

export function useProgressActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const favorite = useMutation({
    mutationFn: (id: string) => toggleFavorite(id),
    onSuccess: invalidate,
  });

  const status = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QStatus }) => setStatus(id, status),
    onSuccess: invalidate,
  });

  const grade = useMutation({
    mutationFn: ({ id, quality }: { id: string; quality: 0 | 3 | 5 }) => review(id, quality),
    onSuccess: invalidate,
  });

  return { favorite, status, grade };
}
