import { Box, Group } from '@mantine/core';
import React from 'react';

export const UISplashMain: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <>
        <Box ta='center'>Choose preferred language</Box>
        <Group mt={8} justify='center'>
            {children}
        </Group>
    </>;
};
