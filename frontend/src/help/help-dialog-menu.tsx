import { NavLink, Stack, Text } from '@mantine/core';
import type React from 'react';
import { Route } from '../routes/__root';
import { useHelpMenuItems } from './hooks/use-help-menu-items';

type HelpDialogMenuProps = {
    finalSelectedPath: string;
};

export const HelpDialogMenu: React.FC<HelpDialogMenuProps> = ({ finalSelectedPath }) => {

    const { menuItems } = useHelpMenuItems();

    return <Stack gap={0}>
        {menuItems.map(menuItem => {
            const selected = menuItem.path === finalSelectedPath;

            return <NavLink
                key={menuItem.id}
                component={Route.Link}
                to={'.'}
                search={{ help: menuItem.endPath }}
                active={selected}
                variant="filled"
                label={<Text size='md'>
                    {menuItem.title}
                </Text>}
                bdrs='sm'
            />;
        })}
    </Stack>;
};
