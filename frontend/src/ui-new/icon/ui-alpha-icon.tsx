import { clsx } from 'clsx';
import type React from 'react';
import { iconResources } from '../../ui/icon/icon-resources';
import classes from './ui-icon.module.css';

export const UIAlphaIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={iconResources.pkhex.alpha}
        alt='alpha'
        {...props}
        className={clsx(classes.uiIcon, props.className)}
    />;
};
