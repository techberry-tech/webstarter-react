export interface CityListItem {
  cityInitial: string;
  cityName: string;
}

export interface SearchFlightForm {
  day: string;
  fromCity: string;
  month: string;
  toCity: string;
  year: string;
}

export interface SearchFlightResultItem {
  dayOfWeek: string;
  departTime: string;
  arrivalTime: string;
  price: string;
  flightNumber: string;
}
