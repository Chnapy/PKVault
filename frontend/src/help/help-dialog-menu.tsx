import { css } from '@emotion/css';
import type React from 'react';
import { ButtonLink } from '../ui/button/button';
import docsGen from './docs.gen';
import { useTranslate } from '../translate/i18n';

type HelpDialogMenuProps = {
    finalSelectedPath: string;
};

export const HelpDialogMenu: React.FC<HelpDialogMenuProps> = ({ finalSelectedPath }) => {
    const lang = useTranslate().i18n.language;

    const menu = docsGen
        .filter(item => item.language === lang);

    return <div
        className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
        })}
    >
        {menu.map(menuItem => {
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
