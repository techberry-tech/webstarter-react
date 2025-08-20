import { useAuthStore } from "@/core/auth/store";
import { useQuery } from "@tanstack/react-query";
import { apiCall } from "../client";

export default function useAuthStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const response = await apiCall({
        method: "GET",
        url: "/api/auth/status",
      });
      const user = response.data?.user;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Set the user in the Zustand store
      useAuthStore.getState().setUser(user);

      return user;
    },
    staleTime: 1000 * 5, // 5 seconds
    enabled,
  });
}
