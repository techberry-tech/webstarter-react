import NotFound from "@/components/404/404";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: Root,
  notFoundComponent: NotFound,
});

export default function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}
