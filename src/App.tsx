import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router";
import { router } from "@/core/router/router";

import "@mantine/core/styles.css";
import { themeConfig } from "./core/theme/theme";

function App() {
  return (
    <MantineProvider defaultColorScheme="light" theme={themeConfig}>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
