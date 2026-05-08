import type React from 'react';
import { iconResources } from '../../ui/icon/icon-resources';
import { UIIcon, type UIIconProps } from './ui-icon';

export const UIShinyIcon: React.FC<Omit<UIIconProps, 'src' | 'alt'>> = (props) => {
    return <UIIcon
        src={iconResources.pkhex.shiny}
        alt='shiny'
        {...props}
    />;
};
