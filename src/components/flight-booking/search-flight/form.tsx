import type { CityListItem, SearchFlightForm } from "@/types/flight-booking";
import { Autocomplete, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";

interface SearchFlightFormProps {
  isLoading: boolean;
  cityList: CityListItem[] | undefined;
  onSubmit: (data: SearchFlightForm) => any;
}

interface FormState {
  date: string;
  fromCity: string;
  toCity: string;
}

export default function SearchFlightForm({ isLoading = false, cityList, onSubmit }: SearchFlightFormProps) {
  const cityNames = cityList?.map((city) => city.cityName) || [];

  const { control, handleSubmit } = useForm<FormState>({
    defaultValues: {
      date: "",
      fromCity: "",
      toCity: "",
    },
  });

  const handleFormSubmit = (data: FormState) => {
    const dayjsDate = dayjs(data.date);
    onSubmit({
      fromCity: data.fromCity,
      toCity: data.toCity,
      day: dayjsDate.date().toString(),
      month: dayjsDate.month().toString(),
      year: dayjsDate.year().toString(),
    });
  };

  return (
    <div>
      <h1 className="text-lg font-semibold">Search Flight</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit(handleFormSubmit)}>
        <Controller
          control={control}
          name="date"
          rules={{ required: "Flight date is required" }}
          render={({ field, fieldState }) => (
            <DateInput
              value={field.value}
              onChange={(value) => field.onChange(value || "")}
              label="Flight Date"
              placeholder="Select a date"
              disabled={isLoading}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-2">
          <Controller
            control={control}
            name="fromCity"
            rules={{ required: "From city is required" }}
            render={({ field, fieldState }) => (
              <Autocomplete
                flex={1}
                label="From City"
                placeholder="Select a city"
                data={cityNames}
                disabled={isLoading}
                value={field.value || ""}
                onChange={(value) => field.onChange(value)}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="toCity"
            rules={{ required: "To city is required" }}
            render={({ field, fieldState }) => (
              <Autocomplete
                flex={1}
                label="To City"
                placeholder="Select a city"
                data={cityNames}
                disabled={isLoading}
                value={field.value || ""}
                onChange={(value) => field.onChange(value)}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <Button
          variant="light"
          w="fit-content"
          type="submit"
          leftSection={<IconSearch size={14} />}
          loading={isLoading}
          loaderProps={{ type: "dots" }}
        >
          Search Flight
        </Button>
      </form>
    </div>
  );
}
