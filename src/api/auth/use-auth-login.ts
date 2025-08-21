import { useMutation } from "@tanstack/react-query";
import { makeRequest, type APIResponse } from "../client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
}

export default function useAuthLogin() {
  return useMutation({
    mutationKey: ["authLogin"],
    mutationFn: async (payload: LoginRequest): Promise<APIResponse<LoginResponse>> => {
      const response = await makeRequest({
        method: "POST",
        url: "/api/auth/login",
        data: payload,
        validateUnauthorized: false, // Do not redirect on 401, handle it in the component
      });
      return response;
    },
  });
}
