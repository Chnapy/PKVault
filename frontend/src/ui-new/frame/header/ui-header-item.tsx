import { Button, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import type React from "react";
import { HistoryContext } from '../../../context/history-context';
import { type FileRouteTypes } from "../../../routeTree.gen";

export type UIHeaderItemProps = {
  selected?: boolean;
  to?: FileRouteTypes[ "to" ];
  search?: Record<string, unknown>;
  children: React.ReactNode;
};

export const UIHeaderItem: React.FC<UIHeaderItemProps> = ({
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
      component={Link}
      color='primary.7'
      variant='filled'
      size='compact-md'
      h='auto'
      to={to!}
      search={(oldSearch) => {
        // remove all search params
        const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

        return {
          ...clearedSearch,
          ...search,
        } as never;
      }}
    >
      <Text fw='bold'>
        {children}
      </Text>
    </Button>
  );
};
