import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/landing")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/flight-booking/search-flight" replace />;
}
