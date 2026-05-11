import { Tabs, Text } from '@mantine/core';
import type React from 'react';
import { UIExpandableTabs } from '../expandable-tabs/ui-expandable-tabs';

type UIDetailsSavesProps = {
    value: string;
    data: {
        id: string;
        label: string;
        imgSrc: string;
    }[];
    actions: React.ReactNode;
};

export const UIDetailsSaves: React.FC<UIDetailsSavesProps> = ({ value, data, actions }) => {
    return <UIExpandableTabs
        value={value}
        data={data}
        renderTab={({ item, selected }) => <Tabs.Tab
            key={item.id}
            value={item.id}
            leftSection={<img src={item.imgSrc} height={16} />}
        >
            <Text component={selected ? 'b' : undefined}>{item.label}</Text>
        </Tabs.Tab>}
        renderExpandedTab={() => null}
        actions={actions}
    />;
};
