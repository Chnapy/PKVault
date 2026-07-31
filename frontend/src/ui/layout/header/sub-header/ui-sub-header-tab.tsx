import { Loader, Tabs, Text, type ElementProps } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import type React from 'react';
import type { UISubHeaderTabsData } from './ui-sub-header';

type UISubHeaderTabProps = UISubHeaderTabsData
    & {
        loading?: boolean;
    }
    & Omit<Tabs.Tab.Props & ElementProps<'button'>, 'value'>;

export const UISubHeaderTab: React.FC<UISubHeaderTabProps> = ({ to, search, id, label, loading, disabled, children, ...rest }) => {
    disabled ||= loading;
    return <Tabs.Tab
        renderRoot={to && !rest.onClick
            ? (props => <Link
                to={to}
                search={(oldSearch) => {
                    // remove all search params
                    const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

                    return {
                        ...clearedSearch,
                        ...search,
                    } as never;
                }}
                {...props}
            />)
            : undefined}
        color='primary.6'
        value={id}
        py={0}
        disabled={disabled}
        pos='relative'
        {...rest}
    >
        {children ?? <Text component='div' display='flex' textWrap='nowrap' style={{ alignItems: 'center' }}>
            {label}
        </Text>}

        {loading && <Loader
            color="currentcolor"
            size="1lh"
            pos='absolute'
            left='50%'
            top='50%'
            style={{ transform: 'translate(-50%,-50%)' }}
        />}
    </Tabs.Tab>;
};
