import { Grid } from '@mantine/core';
import type React from 'react';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';

export type UIDetailsContentSummaryProps = {
    heldItem?: React.ReactNode;
    nature?: string;
    ability?: string;
    pid?: string;
};

export const UIDetailsContentSummary: React.FC<UIDetailsContentSummaryProps> = ({
    heldItem, nature, ability, pid
}) => {

    return <Grid>
        <Grid.Col span={4}>
            Held item
        </Grid.Col>
        <UISpriteSizeWrapper<typeof Grid.Col>
            itemSize='1lh'
            component={Grid.Col}
            span={8}
        >
            {heldItem ?? '-'}
        </UISpriteSizeWrapper>

        <Grid.Col span={4}>
            Nature
        </Grid.Col>
        <Grid.Col span={8}>
            {nature ?? '-'}
        </Grid.Col>

        <Grid.Col span={4}>
            Ability
        </Grid.Col>
        <Grid.Col span={8}>
            {ability ?? '-'}
        </Grid.Col>

        <Grid.Col span={4}>
            PID
        </Grid.Col>
        <Grid.Col span={8}>
            {pid ?? '-'}
        </Grid.Col>
    </Grid>;
};
