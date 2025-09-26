import "./ui/global-style.ts";

import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BackendErrorsContext } from './data/backend-errors-context.tsx';
import { DataProvider } from "./data/data-provider.tsx";
import { routeTree } from "./routeTree.gen";
import { SplashMain } from './splash/splash-main.tsx';

// Create a new router instance
const router = createRouter({
  routeTree,
  // required for WinForm
  history: createHashHistory()
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// TODO PRIOR translations en
// TODO PRIOR add dedicated modal for help
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BackendErrorsContext.Provider>
      <DataProvider>
        <SplashMain>
          <RouterProvider router={router} />
        </SplashMain>
      </DataProvider>
    </BackendErrorsContext.Provider>
  </StrictMode>
);
