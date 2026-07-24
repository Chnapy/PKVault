import { AppTheme } from './ui/app-theme.tsx';

import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BackendErrorsContext } from './data/backend-errors-context.tsx';
import { DataProvider } from "./data/data-provider.tsx";
import { routeTree } from "./routeTree.gen";
import { SplashMain } from './splash/splash-main.tsx';
import { FocusControlsProvider } from './ui/interaction/focus-controls/provider/focus-controls-provider.tsx';
import { initFocus } from './ui/interaction/focus/init-focus.ts';

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

initFocus();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BackendErrorsContext.Provider>
      <AppTheme>
        <FocusControlsProvider>
          <DataProvider>
            <SplashMain>
              <RouterProvider router={router} />
            </SplashMain>
          </DataProvider>
        </FocusControlsProvider>
      </AppTheme>
    </BackendErrorsContext.Provider>
  </StrictMode>
);
