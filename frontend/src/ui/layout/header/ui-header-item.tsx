import { Text } from '@mantine/core';
import { Link, useLocation } from '@tanstack/react-router';
import React from "react";
import { HistoryContext } from '../../../context/history-context';
import { type FileRouteTypes } from "../../../routeTree.gen";
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../form/button/ui-button';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UIHeaderItemProps = {
  id: string;
  to?: FileRouteTypes[ "to" ];
  search?: Record<string, unknown>;
  label: string;
  selected?: boolean;
  children: React.ReactNode;
};

export const UIHeaderItem: React.FC<UIHeaderItemProps> = ({
  id,
  to,
  search: defaultSearch,
  label,
  selected,
  children,
}) => {
  const { t } = useTranslate();

  const location = useLocation();

  const historyContext = HistoryContext.useValue();
  const historyValue = to ? historyContext[ to ] : {
    to: location.pathname as never,
    search: location.search,
  } satisfies typeof historyContext[ keyof typeof historyContext ];
  const search = { ...defaultSearch, ...historyValue?.search };

  const { focusProps, controlProps, controlIcons } = useFocusControls({
    scopeNodeId: id,
    controls: [
      getSelectControl({
        label: t('action.select'),
      }),
    ],
  });

  return <WithControlsIcons placement='out' icons={controlIcons('open')}
    my={2}
    style={{ flexShrink: 0 }}
  >
    <UIButton
      component={Link}
      to={to!}
      search={(oldSearch) => {
        // remove all search params
        const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

        return {
          ...clearedSearch,
          ...search,
        } as never;
      }}
      name={id}
      controlLabel={label}
      variant='filled'
      color={selected ? 'primary.6' : 'primary.7'}
      size='compact-sm'
      h={24}
      {...focusProps}
      {...controlProps('open')}
      style={{ pointerEvents: selected ? 'none' : undefined }}
    >
      <Text fw='bold' tt='uppercase'>
        {children}
      </Text>
    </UIButton>
  </WithControlsIcons>;
};
