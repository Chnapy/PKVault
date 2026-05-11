import { Tabs, Text } from '@mantine/core';
import type React from 'react';
import { UIExpandableTabs } from '../expandable-tabs/ui-expandable-tabs';

export type UIStoragePanelGameListProps = {
    value: string;
    data: { id: string; label: string; imgSrc: string }[];
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ value, data }) => {

    return <UIExpandableTabs
        value={value}
        data={data}
        renderTab={({ item, selected }) => <Tabs.Tab key={item.id} value={item.id} leftSection={<img src={item.imgSrc} height={16} />} py={4}>
            <Text component={selected ? 'b' : undefined}>{item.label}</Text>
        </Tabs.Tab>}
        renderExpandedTab={() => null}
    />;
};
