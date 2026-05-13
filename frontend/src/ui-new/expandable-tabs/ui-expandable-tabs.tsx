import { ActionIcon, Scroller, Stack, Tabs, type TabsProps } from '@mantine/core';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React from 'react';

type Data = {
    id: string;
    label: string;
};

type Params<D extends Data> = {
    item: D;
    i: number;
    selected: boolean;
    select: () => void;
};

type Options = {
    expand: () => void;
    reduce: () => void;
};

type UIExpandableTabsOwnProps<D extends Data> = {
    value: D[ 'id' ];
    data: D[];
    onChange: (id: D[ 'id' ]) => void;
    renderTab: (params: Params<D>, opt: Options) => React.ReactNode;
    renderExpanded: (params: Params<D>[], opt: Options) => React.ReactNode;
    left?: React.ReactNode;
    right?: React.ReactNode;
    grow?: boolean;
}

type UIExpandableTabsProps<D extends Data> =
    UIExpandableTabsOwnProps<D>
    & Omit<TabsProps, keyof UIExpandableTabsOwnProps<D>>;

export function UIExpandableTabs<D extends Data = Data>({
    value, data, onChange, renderTab, renderExpanded,
    left, right, grow = true,
    ...tabsProps
}: UIExpandableTabsProps<D>) {
    const [ expanded, setExpanded ] = React.useState(false);

    return <Tabs
        value={value.toString()}
        onChange={id => id && onChange(id)}
        miw={0}
        {...tabsProps}
        style={{
            flexGrow: grow ? 1 : undefined,
            ...tabsProps.style,
        }}
    >
        <Stack>
            <Tabs.List
                style={{
                    flexGrow: 1,
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    gap: 'var(--mantine-spacing-md)',
                }}
            >
                {left}

                <Scroller
                    opacity={expanded ? 0.5 : undefined}
                >
                    {data.map((item, i) => renderTab(
                        {
                            item,
                            i,
                            selected: item.id === value,
                            select: () => onChange(item.id),
                        },
                        {
                            expand: () => setExpanded(true),
                            reduce: () => setExpanded(false),
                        },
                    ))}
                </Scroller>

                <ActionIcon
                    variant='subtle'
                    size='sm'
                    p='xs'
                    mih='1lh'
                    ml={grow ? 'auto' : undefined}
                    onClick={() => setExpanded(value => !value)}
                    color='currentcolor'
                >
                    {expanded
                        ? <ChevronUpIcon />
                        : <ChevronDownIcon />}
                </ActionIcon>

                {right}
            </Tabs.List>

            {expanded && renderExpanded(
                data.map((item, i) => ({
                    item,
                    i,
                    selected: item.id === value,
                    select: () => onChange(item.id),
                })),
                {
                    expand: () => setExpanded(true),
                    reduce: () => setExpanded(false),
                },
            )}
        </Stack>
    </Tabs>;
};
