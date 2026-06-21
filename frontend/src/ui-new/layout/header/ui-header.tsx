import { Box, Flex, Paper, Stack, Tabs, Title } from '@mantine/core';
import { clsx } from 'clsx';
import React from 'react';
import { theme } from '../../../ui/theme';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { ScrollerControlled } from '../../scroller-controlled/scroller-controlled';
import { CurrentPanelProvider } from '../../storage/storage-content/context/ui-current-panel-provider';
import { PanelProvider } from '../../storage/storage-content/context/ui-panel-context';
import { usePanelControls } from '../hooks/use-panel-controls';
import classes from './ui-header.module.css';

export const UIHeader: React.FC<{
    value: string;
    left: React.ReactNode;
    right: React.ReactNode;
    sub?: React.ReactNode;
}> = ({ value, left, right, sub }) => {

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
                            <Tabs
                                className={classes.firstLine}
                                value={value}
                                onChange={tabId => console.log(tabId)}
                                variant='pills'
                                miw={0}
                                style={{
                                }}
                                __vars={{
                                    '--mantine-color-body': 'var(--mantine-color-primary-7)',
                                }}
                            >
                                <Tabs.List
                                    style={{
                                        flexGrow: 1,
                                        alignItems: 'center',
                                        flexWrap: 'nowrap',
                                        gap: 'var(--mantine-spacing-md)',
                                    }}
                                >
                                    <ScrollerControlled
                                        id='header-items' level={1} controlsEnabled
                                        controlsLabel='Change page'
                                        style={{ flexGrow: 1 }}
                                    >
                                        {left}

                                        <Box ml='auto' />

                                        {right}
                                    </ScrollerControlled>
                                </Tabs.List>
                            </Tabs>

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
                    </FocusScope>
                </PanelProvider>
            </CurrentPanelProvider>
        </WithControlsIcons>
    );
};
