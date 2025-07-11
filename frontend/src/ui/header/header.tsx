import type React from "react";
import { theme } from "../theme";

export const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "stretch",
        backgroundImage: `linear-gradient(0deg, transparent 5px, #96979B 5px, #96979B 6px, ${theme.bg.dark} 6px)`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
};
