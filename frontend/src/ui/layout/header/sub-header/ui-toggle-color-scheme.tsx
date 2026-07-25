import { Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { MoonIcon, SunIcon } from 'lucide-react';
import type React from 'react';
import { UIActionIcon, type UIActionIconProps } from '../../../form/button/ui-action-icon';
import { useTranslate } from '../../../../translate/i18n';

export const UIToggleColorScheme: React.FC<Partial<UIActionIconProps>> = (props) => {
    const { t } = useTranslate();

    const colorScheme = useComputedColorScheme('light');

    const { setColorScheme } = useMantineColorScheme();

    const label = colorScheme === 'light' ? t('header.sub.theme.dark') : t('header.sub.theme.light');

    return <Tooltip label={label}>
        <UIActionIcon
            name='color-scheme'
            controlLabel={label}
            onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
            size={24}
            {...props}
        >
            {colorScheme === 'light'
                ? <MoonIcon />
                : <SunIcon />}
        </UIActionIcon>
    </Tooltip>;
};
