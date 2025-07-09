import "./style/global-style";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import { DataProvider } from "./data/data-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>
);
