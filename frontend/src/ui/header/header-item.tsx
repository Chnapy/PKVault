import { css } from "@emotion/css";
import type React from "react";
import { HistoryContext } from '../../context/history-context';
import { type FileRouteTypes } from "../../routeTree.gen";
import { ButtonLikeLink } from '../button/button-like';

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
    <ButtonLikeLink
      to={to!}
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
        backgroundColor: 'initial',
        border: 'none',
        borderRadius: 8,
        outline: 'none',
        textDecoration: selected ? 'underline' : undefined,
        transition: 'background-color .2s',
        display: 'inline-flex',
        alignItems: 'center',

        "&:hover": {
          textDecoration: 'underline',
        },

      })}
    >
      {children}
    </ButtonLikeLink>
  );
};
