import type React from "react";
import { theme } from "../theme";

export const TextContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div
      style={{
        padding: "4px 8px",
        backgroundColor: theme.bg.default,
        borderRadius: 4,
        width: "100%",
      }}
    >
      <div
        style={{
          paddingLeft: 3,
          marginLeft: -2,
          backgroundImage: `linear-gradient(to right, ${theme.bg.default} 4px, transparent 1px), linear-gradient(${theme.border.lines} 1px, transparent 1px)`,
          backgroundSize: "8px 19px",
          lineHeight: "19px",
          minHeight: "100%",
        }}
      >
        <div
          style={{
            display: "block",
            background: theme.bg.default,
            height: 1,
          }}
        />
        {children}
      </div>
    </div>
  );
};
