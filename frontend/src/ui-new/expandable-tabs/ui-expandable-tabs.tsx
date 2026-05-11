import { ActionIcon, Group, Scroller, Stack, Tabs, type TabsProps } from '@mantine/core';
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
};

type UIExpandableTabsProps<D extends Data> = {
    value: D[ 'id' ];
    data: D[];
    renderTab: (params: Params<D>, expand: () => void) => React.ReactNode;
    renderExpandedTab: (params: Params<D>, reduce: () => void) => React.ReactNode;
    actions?: React.ReactNode;
    grow?: boolean;
} & TabsProps;

export function UIExpandableTabs<D extends Data = Data>({
    value, data, renderTab, renderExpandedTab,
    actions, grow = true,
    ...tabsProps
}: UIExpandableTabsProps<D>) {
    const [ expanded, setExpanded ] = React.useState(false);

    return <Tabs
        value={value.toString()}
        miw={0}
        {...tabsProps}
        style={{
            flexGrow: grow ? 1 : undefined,
            ...tabsProps.style,
        }}
    >
        <Stack>
            <Tabs.List style={{ flexGrow: 1, alignItems: 'center', flexWrap: 'nowrap' }}>
                <Scroller>
                    {data.map((item, i) => renderTab(
                        {
                            item,
                            i,
                            selected: item.id === value,
                        },
                        () => setExpanded(true),
                    ))}
                </Scroller>

                <ActionIcon
                    variant='subtle'
                    size='sm'
                    p='xs'
                    mih='1lh'
                    ml='auto'
                    onClick={() => setExpanded(value => !value)}
                    color='currentcolor'
                >
                    {expanded
                        ? <ChevronUpIcon />
                        : <ChevronDownIcon />}
                </ActionIcon>

                {actions}
            </Tabs.List>

            {expanded && <Group>
                {data.map((item, i) => renderExpandedTab(
                    {
                        item,
                        i,
                        selected: item.id === value,
                    },
                    () => setExpanded(false),
                ))}
            </Group>}
        </Stack>
    </Tabs>;
};
