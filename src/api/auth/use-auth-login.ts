import { useMutation } from "@tanstack/react-query";
import { apiCall, type APIResponse } from "../client";

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  message: string;
  access_token: string;
}

export default function useAuthLogin() {
  return useMutation({
    mutationKey: ["authLogin"],
    mutationFn: async (payload: ILoginRequest): Promise<APIResponse<ILoginResponse>> => {
      const response = await apiCall({
        method: "POST",
        url: "/api/auth/login",
        data: { ...payload, return_token_in_response: true },
        validateUnauthorized: false, // Do not redirect on 401, handle it in the component
      });
      return response;
    },
  });
}
