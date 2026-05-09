import { Popover } from '@mantine/core';
import type React from 'react';

type UIStoragePanelWrapperDetailsProps = {
    details: React.ReactNode;
    children: React.ReactNode;
};

export const UIStoragePanelWrapperDetails: React.FC<UIStoragePanelWrapperDetailsProps> = ({ details, children }) => {
    return <Popover
        // opened
        position='right-start'
        closeOnClickOutside={false}
    // hideDetached={false}
    >
        <Popover.Target>
            {children}
        </Popover.Target>

        <Popover.Dropdown
            p={0}
            w={300}
            style={{ border: 'none' }}

        >
            {details}
        </Popover.Dropdown>
    </Popover>;
};
