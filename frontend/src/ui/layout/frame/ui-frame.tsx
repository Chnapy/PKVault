import { Stack, type ElementProps } from '@mantine/core';
import { clsx } from 'clsx';
import type React from 'react';
import classes from './ui-frame.module.css';

type UIFrameProps = ElementProps<'div'>;

export const UIFrame: React.FC<UIFrameProps> = ({ className, children, ...rest }) => {

    return <div
        {...rest}
        data-move-root
        className={clsx(classes.uiFrame, className)}
    >
        <Stack justify='flex-start' className={classes.content} gap={0}>
            {children}
        </Stack>
    </div>;
};
