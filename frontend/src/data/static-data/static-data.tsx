import { useQuery } from "@tanstack/react-query";
import React from "react";
import { loadStaticData } from "./db";
import { StaticDataLoading } from "./static-data-loading";

const useStaticDataInternal = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["static-data"],
    queryFn: loadStaticData,
    ...options,
  });

export const StaticDataGate: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { data, isLoading } = useStaticDataInternal();

  if (isLoading) {
    return <StaticDataLoading step={0} maxStep={0} />;
  }

  if (!data) {
    return "Static data undefined and not loading for some reason";
  }

  return <>{children}</>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStaticData = () => {
  const { data } = useStaticDataInternal({
    enabled: false,
  });

  if (!data) {
    throw new Error("Static data undefined, should not happen.");
  }

  return data;
};
