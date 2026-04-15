import { css } from '@emotion/css';
import type React from 'react';
import { ButtonLink } from '../ui/button/button';
import { useHelpMenuItems } from './hooks/use-help-menu-items';

type HelpDialogMenuProps = {
    finalSelectedPath: string;
};

export const HelpDialogMenu: React.FC<HelpDialogMenuProps> = ({ finalSelectedPath }) => {

    const { menuItems } = useHelpMenuItems();

    return <div
        className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
        })}
    >
        {menuItems.map(menuItem => {
            const selected = menuItem.path === finalSelectedPath;

            return <ButtonLink
                key={menuItem.id}
                to={'.'}
                search={{ help: menuItem.endPath }}
                selected={selected}
                disabled={selected}
            >
                {menuItem.title}
            </ButtonLink>;
        })}
    </div>;
};
