import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pollsApi } from "@/lib/api/polls";
import type { PollFilters, Poll } from "@/lib/types";

export function usePolls(filters?: PollFilters) {
  return useQuery({
    queryKey: ["polls", filters],
    queryFn: () => pollsApi.list(filters),
  });
}

export function useMyPolls() {
  return useQuery({
    queryKey: ["polls", "mine"],
    queryFn: () => pollsApi.myPolls(),
  });
}

export function useMyPollVoteTrend() {
  return useQuery({
    queryKey: ["polls", "mine", "vote-trend"],
    queryFn: () => pollsApi.myPollVoteTrend(),
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Poll> | FormData) => pollsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}
