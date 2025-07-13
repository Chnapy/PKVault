import type React from "react";
import { theme } from "../theme";

export const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "stretch",
        backgroundImage: `linear-gradient(0deg, transparent 5px, #96979B 5px, #96979B 7px, ${theme.bg.dark} 7px)`,
        // backgroundColor: "rgba(0,0,0,0.05)",
        filter: `drop-shadow(3px 3px 0 rgba(0,0,0,0.1))`,
        overflow: "auto",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
};
