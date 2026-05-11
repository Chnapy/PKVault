import { ActionIcon, Checkbox, Divider, Group, Tabs, Text } from '@mantine/core';
import { EllipsisVerticalIcon } from 'lucide-react';
import React from 'react';
import { UIExpandableTabs } from '../../expandable-tabs/ui-expandable-tabs';
import { UIStorageBoxDetailsTab } from './ui-storage-box-details-tab';
import classes from './ui-storage-panel-box-list.module.css';

// TODO
type Data = {
    id: string;
    label: string;
    slotsStates: boolean[];
};

export type UIStoragePanelBoxListProps = {
    data: Data[];
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({ data }) => {

    return <Group align='flex-start' wrap='nowrap'>
        <UIExpandableTabs
            variant='pills'
            value='1'
            data={data}
            renderTab={({ item, selected }) => <Tabs.Tab
                key={item.id}
                value={item.id}
                className={classes.uiStoragePanelBoxList}
                py={0}
                style={{ gap: 4 }}
                rightSection={selected && <Checkbox size='xs' />}
            >
                <Text component={selected ? 'b' : undefined}>{item.label}</Text>
            </Tabs.Tab>}
            renderExpandedTab={({ item, selected }, reduce) => <UIStorageBoxDetailsTab
                key={item.id}
                id={item.id}
                label={item.label}
                selected={selected}
                onClick={reduce}
                slotsStates={item.slotsStates}
            />}
            actions={<>
                <Divider orientation="vertical" h='1lh' />

                <ActionIcon variant='subtle' size='sm' p='xs' color='currentcolor'>
                    {/* dropdown with advanced actions */}
                    <EllipsisVerticalIcon />
                </ActionIcon>

            </>}
        />
    </Group>
};
