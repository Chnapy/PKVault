import { ActionIcon, Checkbox, Divider, Group, Tabs, Text } from '@mantine/core';
import { BoxIcon, CirclePlusIcon, EllipsisVerticalIcon } from 'lucide-react';
import React from 'react';
import { UIExpandableTabs } from '../../expandable-tabs/ui-expandable-tabs';
import { UIBoxExpanded } from './ui-box-expanded';
import classes from './ui-storage-panel-box-list.module.css';

// TODO
type Data = {
    id: string;
    label: string;
    slotsStates: boolean[];
};

export type UIStoragePanelBoxListProps = {
    value: string;
    data: Data[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
};

export const UIStoragePanelBoxList: React.FC<UIStoragePanelBoxListProps> = ({ value, data, onSelect, onDelete }) => {

    return <Group align='flex-start' wrap='nowrap'>
        <UIExpandableTabs
            variant='pills'
            value={value}
            data={data}
            onChange={onSelect}
            left={<BoxIcon />}
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
            renderExpanded={(data, { reduce }) => <Group>
                {data.map(({ item, selected }) => <UIBoxExpanded
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    slotsStates={item.slotsStates}
                    selected={selected}
                    onSelect={() => {
                        onSelect(item.id);
                        reduce();
                    }}
                    onDelete={() => onDelete(item.id)}
                />)}

                <ActionIcon
                    variant='default'
                    size='xl'
                >
                    <CirclePlusIcon />
                </ActionIcon>
            </Group>}
            right={<>
                <Divider orientation="vertical" h='1lh' />

                <ActionIcon variant='subtle' size='sm' p='xs' color='currentcolor'>
                    {/* dropdown with advanced actions */}
                    <EllipsisVerticalIcon />
                </ActionIcon>

            </>}
        />
    </Group>
};
