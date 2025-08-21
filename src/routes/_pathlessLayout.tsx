import ProtectedRoutes from "@/core/auth/protected";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout")({
  component: ProtectedRoutes,
});
