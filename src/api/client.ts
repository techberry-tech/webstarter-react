import { ROUTE_PATHS } from "@/core/router/config";
import { router } from "@/core/router/router";
import { notifications } from "@mantine/notifications";
import axios, { type AxiosRequestConfig } from "axios";

const client = axios.create({});

interface APIError {
  success: false;
  error: string;
  data: null;
}

interface APISuccess<T> {
  success: true;
  error: null;
  data: T;
}

export type APIResponse<T> = APISuccess<T> | APIError;

export type APICallConfig = AxiosRequestConfig & { validateUnauthorized?: boolean };

export const apiCall = async <T = any>({ validateUnauthorized = true, ...rest }: APICallConfig): Promise<APIResponse<T>> => {
  try {
    const response: APIResponse<T> = await client(rest);
    return {
      success: true,
      data: response.data as T,
      error: null,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Handle 401 Unauthorized error
      if (validateUnauthorized === true && error.response?.status === 401) {
        router.navigate(ROUTE_PATHS.LOGIN);
        notifications.show({
          color: "red",
          message: "Session expired. Please log in again.",
          id: "session-expired",
        });
        return {
          success: false,
          error: "Session expired. Please log in again.",
          data: null,
        };
      }

      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      };
    }
    return {
      success: false,
      error: String(error),
      data: null,
    };
  }
};
