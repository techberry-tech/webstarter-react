import NotFound from "@/pages/404/404";
import { createBrowserRouter } from "react-router";
import ProtectedRoutes from "../auth/protected";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./config";

export const router = createBrowserRouter([
  ...PUBLIC_ROUTES,
  {
    Component: ProtectedRoutes,
    children: PROTECTED_ROUTES,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
