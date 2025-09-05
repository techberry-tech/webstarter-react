import type { CityListItem } from "@/types/flight-booking";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../client";

interface GetCityListResponse {
  content: {
    cityList: CityListItem[];
  };
}

export default function useGetCityList() {
  return useQuery({
    queryKey: ["searchFlight_getCityList"],
    queryFn: async (): Promise<CityListItem[]> => {
      const response = await makeRequest<GetCityListResponse>({
        method: "POST",
        url: "/ic/project/services/WS_getCityList",
        data: {},
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch city list");
      }

      return response.data?.content?.cityList || [];
    },
  });
}
