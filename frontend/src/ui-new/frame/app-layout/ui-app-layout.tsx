import { Container, Grid, Group, Stack } from '@mantine/core';
import type React from 'react';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIFrame } from '../ui-frame';

type UIAppLayoutProps = {
    header: React.ReactNode;
    left: React.ReactNode;
    middle: React.ReactNode;
    right: React.ReactNode;
    bottom: React.ReactNode;
};

export const UIAppLayout: React.FC<UIAppLayoutProps> = ({ header, left, middle, right, bottom }) => {
    return <UIFrame>
        {header}

        <UISpriteSizeWrapper<typeof Container>
            component={Container}
            speciesSize='md'
            fluid style={{ overflow: 'auto', flexGrow: 1 }} w='100%' p='md'>
            <Stack h='100%'>
                <Group grow preventGrowOverflow={false} wrap='nowrap' align='stretch' mih={0} style={{ flexGrow: 1 }}>
                    {left}
                    {middle}
                    {right}
                </Group>

                <Grid grow>
                    <Grid.Col span='auto'>
                        {bottom}
                    </Grid.Col>
                </Grid>
            </Stack>
        </UISpriteSizeWrapper>
    </UIFrame>;
};
