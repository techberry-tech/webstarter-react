import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <div>
      <h1>Main Layout</h1>
      <Outlet />
    </div>
  );
}
