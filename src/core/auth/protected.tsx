import useAuthStatus from "@/api/auth/use-auth-status";
import { Loader } from "@mantine/core";
import { Navigate } from "@tanstack/react-router";
import MainLayout from "../../components/layout/main-layout";

export default function ProtectedRoutes() {
  const { isPending, isError } = useAuthStatus();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader type="dots" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/" replace search={{ logout: true }} />;
  }

  return <MainLayout />;
}
