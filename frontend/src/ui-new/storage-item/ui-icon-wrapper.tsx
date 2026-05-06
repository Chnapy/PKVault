import { ThemeIcon, type ThemeIconProps } from '@mantine/core';
import type React from 'react';

export type UIIconWrapperProps = Pick<ThemeIconProps, 'variant' | 'color' | 'children'>;

export const UIIconWrapper: React.FC<UIIconWrapperProps> = (props) => {
    return <ThemeIcon variant='transparent' color='gray' size='sm' style={{ borderWidth: 0 }} {...props} />;
};
