import { Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { MoonIcon, SunIcon } from 'lucide-react';
import type React from 'react';
import { UIActionIcon, type UIActionIconProps } from '../../../form/button/ui-action-icon';

export const UIToggleColorScheme: React.FC<Partial<UIActionIconProps>> = (props) => {
    const colorScheme = useComputedColorScheme('light');

    const { setColorScheme } = useMantineColorScheme();

    return <Tooltip label='Light mode'>
        <UIActionIcon
            name='color-scheme'
            controlLabel=''
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
