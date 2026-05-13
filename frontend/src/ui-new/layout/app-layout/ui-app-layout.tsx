import { Container, Grid, Stack } from '@mantine/core';
import type React from 'react';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIFrame } from '../frame/ui-frame';

type UIAppLayoutProps = {
    header: React.ReactNode;
    bottom: React.ReactNode;
    footer: React.ReactNode;
    children: React.ReactNode;
};

export const UIAppLayout: React.FC<UIAppLayoutProps> = ({ header, bottom, footer, children }) => {
    return <UIFrame>
        {header}

        <UISpriteSizeWrapper<typeof Container>
            component={Container}
            speciesSize='md'
            fluid style={{ overflow: 'auto', flexGrow: 1 }} w='100%' p='md'>
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
    </UIFrame>;
};
