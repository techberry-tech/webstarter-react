import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest, type APIResponse } from "../client";

export default function useAuthLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["authLogout"],
    mutationFn: async (): Promise<APIResponse<any>> => {
      const response = await makeRequest({
        method: "POST",
        url: "/api/auth/logout",
        validateUnauthorized: false, // Do not redirect on 401, handle it in the component
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authStatus"] });
    },
  });
}
