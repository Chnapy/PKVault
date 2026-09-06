import { ThemeIcon, type ThemeIconProps } from '@mantine/core';
import type React from 'react';

export type UIIconWrapperProps = Pick<ThemeIconProps, 'variant' | 'color' | 'c' | 'children'>;

export const UIIconWrapper: React.FC<UIIconWrapperProps> = (props) => {
    return <ThemeIcon variant='default' size='xs' {...props} />;
};
