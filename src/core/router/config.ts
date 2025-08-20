import type { RouteObject } from "react-router";
import DashboardPage from "../../pages/dashboard/dashboard";
import LoginPage from "../../pages/login/login";

export const ROUTE_PATHS = {
  LOGIN: "/",
  DASHBOARD: "/app/dashboard",
} as const;

export const PUBLIC_ROUTES: RouteObject[] = [
  {
    path: ROUTE_PATHS.LOGIN,
    Component: LoginPage,
  },
] as const;

export const PROTECTED_ROUTES: RouteObject[] = [
  {
    path: ROUTE_PATHS.DASHBOARD,
    Component: DashboardPage,
  },
] as const;
