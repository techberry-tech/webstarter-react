import type { SearchFlightForm, SearchFlightResultItem } from "@/types/flight-booking";
import { useMutation } from "@tanstack/react-query";
import { makeRequest } from "../client";

interface SearchFlightResponse {
  content: {
    flightList: SearchFlightResultItem[];
  };
}

export default function useSearchFlight() {
  return useMutation({
    mutationKey: ["flightBooking_searchFlight"],
    mutationFn: async (payload: SearchFlightForm) => {
      const response = await makeRequest<SearchFlightResponse>({
        method: "POST",
        url: "/ic/project/services/WS_SearchFlightList",
        data: {
          content: payload,
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch flight list");
      }

      return response.data?.content?.flightList || [];
    },
  });
}
