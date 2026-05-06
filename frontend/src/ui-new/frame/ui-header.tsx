import { css } from '@emotion/css';
import { Box, Flex, Paper, Stack, Title } from '@mantine/core';
import React from 'react';
import { theme } from '../../ui/theme';

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
            className={css({
                colorScheme: 'light',
                marginBottom: 0,
                alignItems: 'flex-start',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            })}
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
                    className={css({
                        display: 'flex',
                        padding: 8,
                        paddingTop: 0,
                        paddingLeft: 0,
                        gap: 16,
                        zIndex: 2,
                    })}
                >
                    <img
                        src="/logo.svg"
                        className={css({
                            height: 48,
                            width: 48,
                        })}
                    />

                    <div>
                        <Flex gap={12}>
                            <div className={css({ backgroundColor: theme.game.red, borderRadius: 99, width: 12, height: 12 })} />
                            <div className={css({ backgroundColor: theme.game.yellow, borderRadius: 99, width: 12, height: 12 })} />
                            <div className={css({ backgroundColor: theme.game.emerald, borderRadius: 99, width: 12, height: 12 })} />
                        </Flex>
                        <Title order={2}>
                            PKVault
                        </Title>
                    </div>
                </Paper>

                <div
                    className={css({
                        overflow: 'hidden',
                        paddingLeft: 1,
                        marginLeft: -1,
                        marginRight: -150,
                        alignSelf: 'stretch',
                        flexShrink: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                        height: 56,
                    })}
                >
                    <Paper
                        bg='primary.6'
                        shadow='md'
                        radius={0}
                        className={css({
                            height: '100%',
                            width: 150,
                            transform: 'rotate(-45deg)',
                            transformOrigin: 'bottom left',
                            pointerEvents: 'none',
                        })}
                    />
                </div>
            </Flex>

            <Stack gap={0} style={{
                flexGrow: 1,
                paddingLeft: 140,
                boxShadow: `0 2px 0 rgba(0,0,0,0.2), inset rgba(0, 0, 0, 0.2) -2px 2px 0px`,
            }}>
                <Box
                    className={css({
                        flexGrow: 1,
                        display: 'flex',
                        paddingLeft: 60,
                        paddingTop: 2,
                        paddingRight: 2,
                        alignItems: 'center',
                        gap: 16,
                        boxShadow: `0 2px 0 rgba(0,0,0,0.2)`,
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        scrollbarColor: `${theme.bg.contrastdark} ${theme.bg.contrast}`,
                        zIndex: 1,
                    })}
                >
                    {left}

                    <div className={css({
                        marginLeft: 'auto'
                    })}>
                        {right}
                    </div>
                </Box>

                <Box
                    mx='md'
                    p='xs'
                    pl={30}
                    bg={theme.bg.contrastdark}
                    c='inherit'
                    style={{
                        alignSelf: 'flex-start',
                    }}
                >
                    {sub}
                </Box>
            </Stack>
        </Flex>
    );
};
