import { queryOptions } from "@tanstack/react-query"
import { isLoggedIn } from "@/lib/token"
import { AuthAPI } from "@/services/auth"
import type { ItemResponse, UserMeResponse } from "@/types"
import { type QueryOptionsHelper, useItemQuery } from "./base"

export const authQueries = {
  me: () =>
    queryOptions<UserMeResponse>({
      queryKey: ["currentUser"] as const,
      queryFn: async () => {
        const res = await AuthAPI.getMe()
        return res.result
      },
      enabled: isLoggedIn(),
      staleTime: 5 * 60 * 1000,
      retry: false,
    }),
  useMe: <TSelected = UserMeResponse>(
    options?: QueryOptionsHelper<ItemResponse<UserMeResponse>, TSelected>,
  ) => useItemQuery<UserMeResponse, TSelected>(authQueries.me(), options),
}
