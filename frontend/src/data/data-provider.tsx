import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export const DataProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [client] = React.useState(() => new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
