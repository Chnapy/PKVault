import { ActionIcon, Checkbox, Divider, Group, Scroller, Space, Tabs, Text } from '@mantine/core';
import { ChevronDownIcon, EllipsisVerticalIcon } from 'lucide-react';
import type React from 'react';
import classes from './ui-storage-panel-box-list.module.css';

// TODO
type Data = { value: string; label: string; selected?: boolean };

export type UIStoragePanelBoxListProps = {
    data: Data[];
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({ data }) => {

    return <Group align='center' wrap='nowrap'>
        <Tabs
            defaultValue='1'
            variant='pills'
            miw={0}
        >
            <Tabs.List
                className={classes.uiStoragePanelBoxList}
            >
                <Scroller>
                    {data.map(item => <Tabs.Tab
                        key={item.label}
                        value={item.value}
                        p='sm'
                        py={0}
                        rightSection={item.selected && <Checkbox size='xs' />}
                    >
                        <Text component={item.selected ? 'b' : undefined}>{item.label}</Text>
                    </Tabs.Tab>)}
                </Scroller>
            </Tabs.List>
        </Tabs>

        <Space style={{ marginLeft: 'auto' }} />

        <ActionIcon variant='subtle' size='sm'>
            {/* dropdown with all boxes */}
            <ChevronDownIcon />
        </ActionIcon>

        <Divider orientation="vertical" />

        <ActionIcon variant='subtle' size='sm'>
            {/* dropdown with advanced actions */}
            <EllipsisVerticalIcon />
        </ActionIcon>
    </Group>;
};
