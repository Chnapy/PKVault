import { ActionIcon, Group, Tabs, Text } from '@mantine/core';
import { CirclePlusIcon } from 'lucide-react';
import type React from 'react';
import { UIExpandableTabs } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIGameExpanded, type UIGameData } from './ui-game-expanded';

export type UIStoragePanelGameListProps = {
    value: string;
    data: UIGameData[];
    onChange: (id: string) => void;
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data, onChange }) => {

    return <UIExpandableTabs
        value={value}
        data={data}
        onChange={onChange}
        renderTab={({ item, selected }) => <Tabs.Tab key={item.id} value={item.id} leftSection={<img src={item.imgSrc} height={16} />} py={4}>
            <Text component={selected ? 'b' : undefined}>{item.label}</Text>
        </Tabs.Tab>}
        renderExpanded={(data, { reduce }) => <Group
            p='md'
            pt={0}
        >
            {data.map(({ item, selected }) => <UIGameExpanded
                key={item.id}
                {...item}
                selected={selected}
                onSelect={() => {
                    onChange(item.id);
                    reduce();
                }}
            />)}

            <ActionIcon
                variant='default'
                size='xl'
            >
                <CirclePlusIcon />
            </ActionIcon>
        </Group>}
    />;
};
