import { Box, Flex, Group, Paper, Stack, Title } from '@mantine/core';
import React from 'react';
import { theme } from '../../../ui/theme';
import classes from './ui-header.module.css';

export const UIHeader: React.FC<{
    left: React.ReactNode;
    right: React.ReactNode;
    sub?: React.ReactNode;
}> = ({ left, right, sub }) => {

    return (
        <Flex
            data-mantine-color-scheme="light"
            c='white'
            bg='primary.7'
            className={classes.uiHeader}
        >
            <Flex style={{
                position: 'absolute',
                left: 0,
                top: 0,
            }}>
                <Paper
                    bg='primary.6'
                    radius={0}
                    shadow='sm'
                    className={classes.left}
                >
                    <img
                        src="/logo.svg"
                        className={classes.logo}
                    />

                    <div>
                        <Flex gap={12}>
                            <div className={classes.bubble} style={{ backgroundColor: theme.game.red }} />
                            <div className={classes.bubble} style={{ backgroundColor: theme.game.yellow }} />
                            <div className={classes.bubble} style={{ backgroundColor: theme.game.emerald }} />
                        </Flex>
                        <Title order={2}>
                            PKVault
                        </Title>
                    </div>
                </Paper>

                <div
                    className={classes.artifactWrapper}
                >
                    <Paper
                        bg='primary.6'
                        shadow='md'
                        radius={0}
                        className={classes.artifact}
                    />
                </div>
            </Flex>

            <Stack className={classes.main} gap={0} maw='100%'>
                <Group className={classes.firstLine} wrap='nowrap'>
                    {left}

                    <Group ml='auto' wrap='nowrap'>
                        {right}
                    </Group>
                </Group>

                <Flex
                    mx='md'
                    p='sm'
                    pl={30}
                    bg='primary.7'
                    c='inherit'
                    miw={0}
                >
                    <Box component='span' h='1lh' />

                    {sub}
                </Flex>
            </Stack>
        </Flex>
    );
};
