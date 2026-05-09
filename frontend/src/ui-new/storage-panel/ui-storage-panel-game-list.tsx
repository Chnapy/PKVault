import { Scroller, Tabs, Text } from '@mantine/core';
import type React from 'react';

export type UIStoragePanelGameListProps = {
    data: { imgSrc: string; value: string; label: string; selected?: boolean }[];
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ data }) => {

    return <Tabs defaultValue='pkvault'>
        <Tabs.List>
            <Scroller edgeGradientColor='white.6'>
                {data.map((item, i) => (
                    <Tabs.Tab key={i} value={item.value} leftSection={<img src={item.imgSrc} height={16} />} py={4}>
                        <Text component={item.selected ? 'b' : undefined}>{item.label}</Text>
                    </Tabs.Tab>
                ))}
            </Scroller>
        </Tabs.List>
    </Tabs>;
};
