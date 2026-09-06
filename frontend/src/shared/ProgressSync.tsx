import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { syncAllProgress } from "./progressSync";

export function ProgressSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    let active = true;
    void syncAllProgress(user)
      .then(() => {
        if (active) void queryClient.invalidateQueries({ queryKey: ["progress"] });
      })
      .catch((error: unknown) => {
        console.error("Progress synchronization failed", error);
      });

    return () => {
      active = false;
    };
  }, [queryClient, user]);

  return null;
}
