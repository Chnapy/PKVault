import { clsx } from 'clsx';
import type React from 'react';
import { iconResources } from '../../ui/icon/icon-resources';
import classes from './ui-icon.module.css';

export const UIShinyIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={iconResources.pkhex.shiny}
        alt='shiny'
        {...props}
        className={clsx(classes.uiIcon, props.className)}
    />;
};
