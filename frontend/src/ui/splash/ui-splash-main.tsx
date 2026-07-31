import { Box, Card, Group, Stack } from '@mantine/core';
import React from 'react';
import { inputIconResources } from '../icon/resources/input-icon-resources';
import { inputIcon } from '../interaction/controls/icons/get-control-icon';

export const UISplashMain: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <Stack align='center'>
        <Card p='lg'>
            <Box ta='center'>Choose preferred language</Box>
            <Group mt={8} justify='center'>
                {children}
            </Group>
        </Card>

        <Group c='white' wrap='nowrap' gap='xs'>
            {inputIcon(inputIconResources.type.mouse)} Mouse,
            {inputIcon(inputIconResources.type.keyboard)} Keyboard,
            {inputIcon(inputIconResources.type.gamepad)} Gamepad
            {' '}are supported.
        </Group>
    </Stack>;
};
