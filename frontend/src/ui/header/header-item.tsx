import { css } from "@emotion/css";
import { Button } from "@headlessui/react";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { type FileRouteTypes } from "../../routeTree.gen";
import { theme } from "../theme";

export type HeaderItemProps = {
  selected?: boolean;
  to: FileRouteTypes[ "to" ];
};

export const HeaderItem: React.FC<React.PropsWithChildren<HeaderItemProps>> = ({
  selected,
  to,
  children,
}) => {
  return (
    <Button
      as={Link}
      to={to}
      search={() => ({} as never)}
      className={css({
        flexGrow: 1,
        fontWeight: "bold",
        fontSize: 32,
        textAlign: "center",
        textTransform: "uppercase",
        color: theme.text.heading,
        textShadow: "2px 2px 0px rgba(255,255,255,0.2)",
        opacity: selected ? 1 : 0.5,
        whiteSpace: "nowrap",
        display: "flex",

        backgroundColor: selected ? theme.bg.default : "transparent",
        border: selected ? theme.border.default : "1px solid transparent",
        borderTopWidth: 0,
        borderRadius: 8,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        padding: 4,
        paddingTop: 0,
        cursor: selected ? undefined : "pointer",
        transition: ".2s opacity",
        "&:hover": {
          opacity: 1,
        },
      })}
    >
      <div
        className={css({
          flexGrow: 1,
          borderRadius: 8,
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
          borderTop: "none",
          backgroundColor: selected ? theme.bg.dark : undefined,
          padding: "4px 16px",
        })}
      >
        {children}
      </div>
    </Button>
  );
};
