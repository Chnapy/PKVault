import "./ui/global-style.ts";

import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BackendErrorsContext } from './data/backend-errors-context.tsx';
import { DataProvider } from "./data/data-provider.tsx";
import { routeTree } from "./routeTree.gen";
import { SplashMain } from './splash/splash-main.tsx';

const router = createRouter({
  routeTree,
  // required for desktop
  history: createHashHistory()
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

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
