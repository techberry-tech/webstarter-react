import { createBrowserRouter } from "react-router";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./config";
import ProtectedRoutes from "./protected";
import NotFound from "@/pages/404/404";

export const router = createBrowserRouter([
  ...PUBLIC_ROUTES,
  {
    Component: ProtectedRoutes,
    children: PROTECTED_ROUTES,
  },
  {
    path: "*",
    Component: NotFound,
  }
]);
