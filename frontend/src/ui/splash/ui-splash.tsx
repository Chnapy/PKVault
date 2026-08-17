import { Loader, Stack } from '@mantine/core';
import type React from 'react';
import classes from './ui-splash.module.css';

export const UISplash: React.FC<{
    loading?: boolean;
    children?: React.ReactNode;
}> = ({ loading, children }) => <Stack
    bg='primary'
    h='100vh'
    align='center'
    justify='center'
    gap='lg'
    p='lg'
>
    <img
        className={classes.uiSplashLogo}
        src='/logo.svg'
        style={{
            width: 128,
            height: 128,
        }}
    />

    {loading && <Loader type='dots' color='white' />}

    {children}
</Stack>;
