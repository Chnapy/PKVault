import type React from "react";
import { theme } from "../theme";

export type TitleContainerProps = {
  title: string;
};

export const TitleContainer: React.FC<
  React.PropsWithChildren<TitleContainerProps>
> = ({ title, children }) => {
  return (
    <div
      style={{
        padding: "4px 8px",
        backgroundColor: theme.bg.default,
        borderRadius: 4,
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${theme.border.lines}`,
          textAlign: "center",
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};
