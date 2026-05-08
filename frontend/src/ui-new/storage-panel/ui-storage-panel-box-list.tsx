import { ActionIcon, Checkbox, Divider, Group, OverflowList, Space, Tabs, Text } from '@mantine/core';
import { Box as BoxIcon, ChevronDown, MoreVertical } from 'pixelarticons/react';
import type React from 'react';
import classes from './ui-storage-panel-box-list.module.css';

// TODO
type Data = { value: string; label: string; selected?: boolean };

export type UIStoragePanelBoxListProps = {
    data: Data[];
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({ data }) => {

    return <Group align='center' gap='xs' wrap='nowrap'>
        <Tabs
            defaultValue='1'
            variant='pills'
        >
            <Tabs.List
                className={classes.uiStoragePanelBoxList}
            >
                <OverflowList<Data>
                    data={data}
                    display={'flex'}
                    style={{ alignItems: 'center' }}
                    renderItem={(item) => <Tabs.Tab
                        value={item.value}
                        p='xs'
                        py={0}
                        rightSection={item.selected && <Checkbox size='xs' />}
                    >
                        <Text component={item.selected ? 'b' : undefined}>{item.label}</Text>
                    </Tabs.Tab>}
                    renderOverflow={(items) => <ActionIcon variant='subtle' size='sm'>
                        <ChevronDown />
                    </ActionIcon>}
                />
            </Tabs.List>
        </Tabs>

        <Space style={{ marginLeft: 'auto' }} />

        <ActionIcon variant='subtle' size='sm'>
            {/* dropdown with all boxes */}
            <BoxIcon />
        </ActionIcon>

        <Divider orientation="vertical" />

        <ActionIcon variant='subtle' size='sm'>
            {/* dropdown with advanced actions */}
            <MoreVertical />
        </ActionIcon>
    </Group>;
};
