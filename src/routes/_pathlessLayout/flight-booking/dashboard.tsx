import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/flight-booking/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello DashboardPage</div>;
}
