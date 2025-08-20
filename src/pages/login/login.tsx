import { Title, Anchor, Paper, TextInput, PasswordInput, Button, Text } from "@mantine/core";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Title ta="center">Welcome back!</Title>

      <Text>
        Please sign in to your account.
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md" w="100%" maw="400px">
        <TextInput label="Username" placeholder="you@example.com" required radius="md" />
        <PasswordInput label="Password" placeholder="Your password" required mt="md" radius="md" />
        <Button fullWidth mt="xl" radius="md">
          Sign in
        </Button>
      </Paper>
    </div>
  );
}
