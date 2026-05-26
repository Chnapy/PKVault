import { Tabs, Text } from '@mantine/core';
import type React from 'react';

type UISettingsTabProps = Tabs.Tab.Props;;

export const UISettingsTab: React.FC<UISettingsTabProps> = ({ children, ...rest }) => {
    return <Tabs.Tab
        color='primary.6'
        py={0}
        {...rest}
    >
        <Text display='flex' style={{ alignItems: 'center' }}>
            {children}
        </Text>
    </Tabs.Tab>
};
