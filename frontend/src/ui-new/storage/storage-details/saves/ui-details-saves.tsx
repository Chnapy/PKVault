import { Group, Tabs, Text } from '@mantine/core';
import type React from 'react';
import { UIExpandableTabs } from '../../../expandable-tabs/ui-expandable-tabs';
import { UIDetailsSaveExpanded, type UIDetailsSaveData } from './ui-details-save-expanded';

type UIDetailsSavesProps = {
    value: string;
    data: UIDetailsSaveData[];
    onSelect: (id: string) => void;
    actions: React.ReactNode;
};

export const UIDetailsSaves: React.FC<UIDetailsSavesProps> = ({ value, data, onSelect, actions }) => {
    return <UIExpandableTabs
        value={value}
        data={data}
        onChange={onSelect}
        renderTab={({ item, selected }) => <Tabs.Tab
            key={item.id}
            value={item.id}
            leftSection={<img src={item.imgSrc} height={16} />}
        >
            <Text component={selected ? 'b' : undefined}>{item.label}</Text>
        </Tabs.Tab>}
        renderExpanded={(data, { reduce }) => <Group
            p='md'
            pt={0}
        >
            {data.map(({ item, selected }) => <UIDetailsSaveExpanded
                key={item.id}
                {...item}
                selected={selected}
                onSelect={() => {
                    onSelect(item.id);
                    reduce();
                }}
            />)}
        </Group>}
        right={actions}
    />;
};
