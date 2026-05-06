import { Space, Tabs, Text } from '@mantine/core';
import type React from 'react';

export type UIStoragePanelGameListProps = {
    data: { imgSrc: string; value: string; label: string; selected?: boolean }[];
};

export const UIStoragePanelGameList: React.FC<UIStoragePanelGameListProps> = ({ data }) => {

    return <>
        <Tabs defaultValue='pkvault' variant='outline'>
            <Tabs.List p={4} pb={0}>
                {data.map((item, i) => (
                    <Tabs.Tab key={i} value={item.value} leftSection={<img src={item.imgSrc} height={16} />} py={4}>
                        <Text size='md' fw={item.selected ? 'bold' : undefined}>{item.label}</Text>
                    </Tabs.Tab>
                ))}

                <Space style={{ flexGrow: 1 }} />
            </Tabs.List>
        </Tabs>
    </>;
};
