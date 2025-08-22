import useGetCityList from "@/api/flight-booking/get-city-list";
import useSearchFlight from "@/api/flight-booking/search-flight";
import SearchFlightForm from "@/components/flight-booking/search-flight/form";
import SearchFlightTable from "@/components/flight-booking/search-flight/table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/flight-booking/search-flight")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: cityList, isFetching: isFetchingCities } = useGetCityList();
  const { data: searchList, isPending: isSearching, mutate: searchFlight } = useSearchFlight();

  const isLoading = isFetchingCities || isSearching;

  return (
    <div className="relative p-4">
      <SearchFlightForm isLoading={isLoading} cityList={cityList} onSubmit={searchFlight} />
      <SearchFlightTable data={searchList} />
    </div>
  );
}
