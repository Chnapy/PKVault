import { Group } from '@mantine/core';
import type React from 'react';

type UIStorageContentProps = {
    left: React.ReactNode;
    right: React.ReactNode;
    // middle: React.ReactNode;
};

export const UIStorageContent: React.FC<UIStorageContentProps> = ({ left, right }) => {
    return <Group grow wrap='nowrap' align='stretch' mih={0} style={{ flexGrow: 1 }}>
        {left}
        {/* {middle} */}
        {right}
    </Group>;
};
