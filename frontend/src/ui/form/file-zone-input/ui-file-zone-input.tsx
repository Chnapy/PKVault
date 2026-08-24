import { Dropzone, type DropzoneProps } from '@mantine/dropzone';
import { clsx } from 'clsx';
import React from 'react';
import classes from './ui-file-zone-input.module.css';

export const UIFileZoneInput: React.FC<DropzoneProps> = (props) => {
    return <Dropzone
        {...props}
        className={clsx(props.className, props.disabled && classes.disabled)}
    />;
};
