import useAuthLogin, { type LoginRequest } from "@/api/auth/use-auth-login";
import useAuthStatus from "@/api/auth/use-auth-status";
import { Button, Loader, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Login,
});

export default function Login() {
  const search = Route.useSearch() as any;
  const logout = search.logout ?? false;
  const navigate = useNavigate();
  const { isPending, mutateAsync } = useAuthLogin();
  const { isFetching, isSuccess } = useAuthStatus(!logout);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader type="dots" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (isSuccess) {
    return <Navigate to="/landing" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    } satisfies LoginRequest;
    // Call the login mutation
    const result = await mutateAsync(data);
    if (!result.success) {
      notifications.show({
        color: "red",
        message: result.error,
        id: "login-error",
      });
      return;
    }

    // On success, navigate to the admin dashboard
    navigate({ to: "/landing" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Title ta="center">Welcome back!</Title>

      <Text>Please sign in to your account.</Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md" w="100%" maw="400px">
        <form onSubmit={handleSubmit}>
          <TextInput name="username" label="Username" placeholder="Your username" required radius="md" />
          <PasswordInput name="password" label="Password" placeholder="Your password" required mt="md" radius="md" />
          <Button type="submit" fullWidth mt="xl" radius="md" loading={isPending}>
            Sign in
          </Button>
        </form>
      </Paper>
    </div>
  );
}
