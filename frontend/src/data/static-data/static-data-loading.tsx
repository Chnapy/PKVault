import React from "react";

type StaticDataLoadingProps = {
  step: number;
  maxStep: number;
};

export const StaticDataLoading: React.FC<StaticDataLoadingProps> = () => {
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
      <div>Loading static data...</div>
    </div>
  );
};
