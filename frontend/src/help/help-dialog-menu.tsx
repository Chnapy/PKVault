import { Stack } from '@mantine/core';
import type React from 'react';
import { HelpDialogMenuItem } from './help-dialog-menu-item';
import { useHelpMenuItems } from './hooks/use-help-menu-items';

type HelpDialogMenuProps = {
    finalSelectedPath: string;
};

export const HelpDialogMenu: React.FC<HelpDialogMenuProps> = ({ finalSelectedPath }) => {
    const { menuItems } = useHelpMenuItems();

    return <Stack gap={0}>
        {menuItems.map(menuItem => {
            return <HelpDialogMenuItem
                key={menuItem.id}
                endPath={menuItem.endPath}
                selected={menuItem.path === finalSelectedPath}
                title={menuItem.title}
            />;
        })}
    </Stack>;
};
