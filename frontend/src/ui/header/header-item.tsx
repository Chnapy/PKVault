import { css } from "@emotion/css";
import { Button } from "@headlessui/react";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { type FileRouteTypes } from "../../routeTree.gen";
import { HistoryContext } from '../../context/history-context';

export type HeaderItemProps = {
  selected?: boolean;
  to?: FileRouteTypes[ "to" ];
  search?: Record<string, unknown>;
};

export const HeaderItem: React.FC<React.PropsWithChildren<HeaderItemProps>> = ({
  selected,
  to,
  search: defaultSearch,
  children,
}) => {
  const historyContext = HistoryContext.useValue();
  const historyValue = to ? historyContext[ to ] : undefined;
  const search = { ...defaultSearch, ...historyValue?.search };

  return (
    <Button
      as={Link}
      to={to}
      search={(oldSearch) => {
        // remove all search params
        const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

        return {
          ...clearedSearch,
          ...search,
        } as never;
      }}
      className={css({
        color: 'inherit',
        textTransform: 'uppercase',
        padding: '8px 16px',
        borderRadius: 8,
        textDecoration: selected ? 'underline' : undefined,
        transition: 'background-color .2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,

        "&:hover": {
          textDecoration: 'underline',
        },

      })}
    >
      {children}
    </Button>
  );
};
