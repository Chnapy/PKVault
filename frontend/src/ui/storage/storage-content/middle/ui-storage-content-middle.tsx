import { Paper, Stack } from '@mantine/core';
import type React from 'react';

export const UIStorageContentMiddle: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <Paper
        withBorder
        bdrs={0}
        h='100%'
        py='md'
        style={{
            borderLeft: 'none',
            borderRight: 'none',
        }}
    >
        <Stack h='100%' justify='center'>
            {children}
        </Stack>
    </Paper>;
};
