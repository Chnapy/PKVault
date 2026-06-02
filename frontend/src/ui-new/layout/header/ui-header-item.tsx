import { Tabs, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import type React from "react";
import { HistoryContext } from '../../../context/history-context';
import { type FileRouteTypes } from "../../../routeTree.gen";

export type UIHeaderItemProps = {
  id: string;
  to?: FileRouteTypes[ "to" ];
  search?: Record<string, unknown>;
  children: React.ReactNode;
};

export const UIHeaderItem: React.FC<UIHeaderItemProps> = ({
  id,
  to,
  search: defaultSearch,
  children,
}) => {
  const historyContext = HistoryContext.useValue();
  const historyValue = to ? historyContext[ to ] : undefined;
  const search = { ...defaultSearch, ...historyValue?.search };

  return (
    <Tabs.Tab
      renderRoot={props => (
        <Link
          to={to!}
          search={(oldSearch) => {
            // remove all search params
            const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

            return {
              ...clearedSearch,
              ...search,
            } as never;
          }}
          {...props}
        />
      )}
      value={id}
      size='compact-sm'
      h={27}
      style={{ flexShrink: 0 }}
    >
      <Text fw='bold'>
        {children}
      </Text>
    </Tabs.Tab>
  );
};
