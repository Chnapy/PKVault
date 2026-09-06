import { clsx } from 'clsx';
import type React from 'react';
import classes from './ui-icon.module.css';

export type UIIconProps = {
    size?: 'small' | 'medium' | 'big';
    disabled?: boolean;
} & Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'height' | 'width'>;

export const UIIcon: React.FC<UIIconProps> = ({ size, disabled, className, ...rest }) => {
    return <img
        {...rest}
        className={clsx(
            classes.uiIcon,
            {
                [ classes.small ]: size === 'small',
                [ classes.big ]: size === 'big',
                [ classes.disabled ]: disabled,
            },
            className,
        )}
    />;
};
