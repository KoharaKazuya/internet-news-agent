import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  getFeeds,
  getPrompt,
  updateFeeds,
  updatePrompt,
} from "~/database/user";
import { useCurrentUser } from "~/firebase";

export function useUserPrompt() {
  const user = useCurrentUser();
  return useSuspenseQuery({
    queryKey: ["users", user!.uid, "prompt"],
    queryFn: () => getPrompt({ userId: user!.uid }),
  });
}

export function useUserPromptMutation() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prompt: string) => updatePrompt({ userId: user!.uid, prompt }),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["users", user!.uid, "prompt"],
      });
    },
  });
}

export function useUserFeeds() {
  const user = useCurrentUser();
  return useSuspenseQuery({
    queryKey: ["users", user!.uid, "feeds"],
    queryFn: () => getFeeds({ userId: user!.uid }),
  });
}

export function useUserFeedsMutation() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feeds: { url: string }[]) =>
      updateFeeds({ userId: user!.uid, feeds }),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["users", user!.uid, "feeds"],
      });
    },
  });
}
