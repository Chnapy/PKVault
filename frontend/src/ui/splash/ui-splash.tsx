import { Card, Stack } from '@mantine/core';
import type React from 'react';

export const UISplash: React.FC<React.PropsWithChildren> = ({ children }) => <Stack
    bg='primary'
    h='100vh'
    align='center'
    justify='center'
    gap='lg'
    p='lg'
>
    <img
        src='/logo.svg'
        style={{
            width: 128,
            height: 128,
        }}
    />

    {children && <Card p='lg'>
        {children}
    </Card>}
</Stack>;
