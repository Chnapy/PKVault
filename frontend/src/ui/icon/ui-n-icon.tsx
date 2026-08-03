import type React from 'react';
import { iconResources } from './resources/icon-resources';
import { UIIcon, type UIIconProps } from './ui-icon';

export const UINIcon: React.FC<Omit<UIIconProps, 'src' | 'alt'>> = (props) => {
    return <UIIcon
        src={iconResources.misc.n}
        alt='N'
        {...props}
    />;
};
