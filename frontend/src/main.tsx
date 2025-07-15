import "./ui/global-style.ts";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DataProvider } from "./data/data-provider.tsx";
import { StaticDataGate } from "./data/static-data/static-data.tsx";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataProvider>
      <StaticDataGate>
        <RouterProvider router={router} />
      </StaticDataGate>
    </DataProvider>
  </StrictMode>
);
