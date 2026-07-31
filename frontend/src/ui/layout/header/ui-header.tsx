import { Box, Flex, Group, Paper, Stack, Title } from '@mantine/core';
import { clsx } from 'clsx';
import React from 'react';
import { baseTheme } from '../../base-theme';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { CurrentPanelProvider } from '../../storage/storage-content/context/ui-current-panel-provider';
import { PanelProvider } from '../../storage/storage-content/context/ui-panel-context';
import { usePanelControls } from '../hooks/use-panel-controls';
import { UIToggleColorScheme } from './sub-header/ui-toggle-color-scheme';
import classes from './ui-header.module.css';

export const UIHeader: React.FC<{
    left: React.ReactNode;
    right: React.ReactNode;
    sub?: React.ReactNode;
}> = ({ left, right, sub }) => {

    const { panelProps, nodeId, childScopeId, controlIcons } = usePanelControls('header');

    return (
        <WithControlsIcons placement='in' icons={controlIcons('open')}
            data-mantine-color-scheme="light"
            c='white'
            bg='primary.7'
            {...panelProps}
            className={clsx(classes.uiHeader, panelProps.className)}
        >
            <CurrentPanelProvider value={'header'}>
                <PanelProvider value='header'>
                    <FocusScope id={childScopeId} parentNodeId={nodeId}>
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
                                        <div className={classes.bubble} style={{ backgroundColor: baseTheme.other.game.red }} />
                                        <div className={classes.bubble} style={{ backgroundColor: baseTheme.other.game.yellow }} />
                                        <div className={classes.bubble} style={{ backgroundColor: baseTheme.other.game.emerald }} />
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
                            <Group className={classes.firstLine} gap='sm' pr='sm'>
                                {left}

                                <Box ml='auto' />

                                {right}
                            </Group>

                            <Group
                                ml='md'
                                p='sm'
                                pl={30}
                                bg='primary.7'
                                c='inherit'
                                miw={0}
                                align='flex-start'
                                gap='sm'
                            >
                                {sub}

                                <UIToggleColorScheme
                                    ml='auto'
                                />
                            </Group>
                        </Stack>
                    </FocusScope>
                </PanelProvider>
            </CurrentPanelProvider>
        </WithControlsIcons>
    );
};
