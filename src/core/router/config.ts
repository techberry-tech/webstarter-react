import type { RouteObject } from "react-router";
import LoginPage from "../../pages/common/login/login";
import DashboardPage from "../../pages/flight-booking/dashboard/dashboard";

export const ROUTE_PATHS = {
  COMMON: {
    LOGIN: "/",
  },
  LANDING: "/app/flight-booking/dashboard",
  FLIGHT_BOOKING: {
    DASHBOARD: "/app/flight-booking/dashboard",
  },
  ACCOUNTING: {
    USERS: "/app/accounting/users",
  },
} as const;

export const PUBLIC_ROUTES: RouteObject[] = [
  {
    path: ROUTE_PATHS.COMMON.LOGIN,
    Component: LoginPage,
  },
] as const;

export const PROTECTED_ROUTES: RouteObject[] = [
  {
    path: ROUTE_PATHS.FLIGHT_BOOKING.DASHBOARD,
    Component: DashboardPage,
  },
] as const;
