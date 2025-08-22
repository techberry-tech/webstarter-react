import type { CityListItem, SearchFlightForm } from "@/types/flight-booking";
import { Autocomplete, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";

interface SearchFlightFormProps {
  isLoading: boolean;
  cityList: CityListItem[] | undefined;
  onSubmit: (data: SearchFlightForm) => any;
}

export default function SearchFlightForm({ isLoading = false, cityList, onSubmit }: SearchFlightFormProps) {
  const cityNames = cityList?.map((city) => city.cityName) || [];

  const handleSubmit = () => {
    onSubmit({
      fromCity: "New York",
      toCity: "Los Angeles",
      day: "15",
      month: "10",
      year: "2023",
    });
  };

  return (
    <div>
      <h1 className="text-lg font-semibold">Search Flight</h1>
      <div className="flex flex-col gap-2">
        <DateInput
          // value={value}
          // onChange={setValue}
          label="Flight Date"
          placeholder="Select a date"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <Autocomplete flex={1} label="From City" placeholder="Select a city" data={cityNames} disabled={isLoading} />
          <Autocomplete flex={1} label="To City" placeholder="Select a city" data={cityNames} disabled={isLoading} />
        </div>
        <Button w="fit-content" leftSection={<IconSearch size={14} />} onClick={handleSubmit} loading={isLoading} loaderProps={{ type: "dots" }}>
          Search Flight
        </Button>
      </div>
    </div>
  );
}
