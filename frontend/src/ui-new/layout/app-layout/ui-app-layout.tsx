import { Container, Grid, Stack } from '@mantine/core';
import React from 'react';
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

    React.useEffect(() => {
        const previousValue = document.body.dataset.controlsType;
        if (previousValue !== controlsCurrentType) {
            document.body.dataset.controlsType = controlsCurrentType;

            if (controlsCurrentType !== 'mouse')
                document.body.dataset.showFocus = 'true';
            else
                delete document.body.dataset.showFocus
        }
    }, [ controlsCurrentType ]);

    return <UIFrame>
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
