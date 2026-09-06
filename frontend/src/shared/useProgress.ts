import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";
import { type QStatus, getAllProgress, setStatus, toggleFavorite } from "./progress";
import { pushProgress } from "./progressSync";

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
  const { user } = useAuth();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });
  const sync = (progress: Awaited<ReturnType<typeof toggleFavorite>>) => {
    if (!user) return;
    void pushProgress(user.id, progress).catch((error: unknown) => {
      console.error("Progress upload failed; it will retry at the next sign-in.", error);
    });
  };

  const favorite = useMutation({
    mutationFn: (id: string) => toggleFavorite(id),
    onSuccess: (progress) => {
      sync(progress);
      void invalidate();
    },
  });

  const status = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QStatus }) => setStatus(id, status),
    onSuccess: (progress) => {
      sync(progress);
      void invalidate();
    },
  });

  return { favorite, status };
}
