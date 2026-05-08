import { Tabs, Text } from '@mantine/core';
import type React from 'react';

type UISaveTabProps = {
    saveId: number;
    imgSrc: string;
    label: string;
    selected?: boolean;
};

export const UISaveTab: React.FC<UISaveTabProps> = ({ saveId, imgSrc, label, selected }) => {
    return <Tabs.Tab
        value={saveId.toString()}
        leftSection={<img src={imgSrc} height={16} />}
    >
        <Text component={selected ? 'b' : undefined}>{label}</Text>
    </Tabs.Tab>;
};
