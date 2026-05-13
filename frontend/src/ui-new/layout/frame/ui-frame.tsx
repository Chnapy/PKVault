import { Stack } from '@mantine/core';
import type React from 'react';
import classes from './ui-frame.module.css';

export const UIFrame: React.FC<React.PropsWithChildren> = ({ children }) => {

    return <div data-move-root className={classes.uiFrame}>
        <Stack justify='flex-start' className={classes.content} gap={0}>
            {children}
        </Stack>
    </div>;
};
