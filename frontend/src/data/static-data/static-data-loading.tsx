import React from "react";
import { theme } from "../../ui/theme";

type StaticDataLoadingProps = {
  step: number;
  maxStep: number;
};

export const StaticDataLoading: React.FC<StaticDataLoadingProps> = ({
  step,
  maxStep,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        flexDirection: "column",
      }}
    >
      <div>
        Loading static data... {step}/{maxStep}
      </div>
      <div
        style={{
          width: 300 * (1 - step / maxStep),
          height: 4,
          background: theme.text.primary,
          borderRadius: 8,
          transition: ".4s width",
        }}
      ></div>
    </div>
  );
};
