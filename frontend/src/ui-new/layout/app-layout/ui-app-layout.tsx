import { Container, Grid, Stack } from '@mantine/core';
import type React from 'react';
import { ErrorCatcher } from '../../../error/error-catcher';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIFrame } from '../frame/ui-frame';

type UIAppLayoutProps = {
    header: React.ReactNode;
    bottom: React.ReactNode;
    footer: React.ReactNode;
    children: React.ReactNode;
};

export const UIAppLayout: React.FC<UIAppLayoutProps> = ({ header, bottom, footer, children }) => {
    const controlsCurrentType = useControlsCurrentType();

    return <UIFrame
        data-controls-type={controlsCurrentType}
    >
        <ErrorCatcher>
            {header}

            <UISpriteSizeWrapper<typeof Container>
                component={Container}
                speciesSize='md'
                fluid style={{ overflow: 'hidden', flexGrow: 1 }} w='100%' p='md'>
                <Stack h='100%'>
                    {children}

                    <Grid grow>
                        <Grid.Col span='auto'>
                            {bottom}
                        </Grid.Col>
                    </Grid>
                </Stack>
            </UISpriteSizeWrapper>

            {footer}
        </ErrorCatcher>
    </UIFrame>;
};
