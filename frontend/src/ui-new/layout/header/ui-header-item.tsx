import { Tabs, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import React from "react";
import { HistoryContext } from '../../../context/history-context';
import { type FileRouteTypes } from "../../../routeTree.gen";
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

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

  const { focusProps, controlProps, controlIcons } = useFocusControls({
    scopeNodeId: id,
    controls: [
      getSelectControl({
        label: 'Select',
      }),
    ],
  });

  return <WithControlsIcons placement='out' icons={controlIcons('open')}
    my={2}
    style={{ flexShrink: 0 }}
  >
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
      h={24}
      {...focusProps}
      {...controlProps('open')}
    >
      <Text fw='bold' tt='uppercase'>
        {children}
      </Text>
    </Tabs.Tab>
  </WithControlsIcons>;
};
