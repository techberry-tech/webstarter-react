import { router } from "@/core/router/router";
import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router";

import "@mantine/core/styles.css";
// ‼️ import notifications styles after core package styles
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { themeConfig } from "./core/theme/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="light" theme={themeConfig}>
        <RouterProvider router={router} />
        <Notifications />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
