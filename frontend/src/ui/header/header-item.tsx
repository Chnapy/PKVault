import { css } from "@emotion/css";
import { Button } from "@headlessui/react";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { type FileRouteTypes } from "../../routeTree.gen";

export type HeaderItemProps = {
  selected?: boolean;
  to: FileRouteTypes[ "to" ];
  endPosition?: boolean;
};

export const HeaderItem: React.FC<React.PropsWithChildren<HeaderItemProps>> = ({
  selected,
  to,
  endPosition,
  children,
}) => {
  return (
    <Button
      as={Link}
      to={to}
      search={(search) => {
        // remove all search params
        return Object.fromEntries(Object.keys(search).map(key => [ key, undefined ])) as never;
      }}
      className={css({
        color: 'inherit',
        textTransform: 'uppercase',
        padding: '8px 16px',
        borderRadius: 8,
        textDecoration: selected ? 'underline' : undefined,
        transition: 'background-color .2s',
        marginLeft: endPosition ? 'auto' : undefined,

        "&:hover": {
          textDecoration: 'underline',
        },

      })}
    >
      {children}
    </Button>
  );
};
