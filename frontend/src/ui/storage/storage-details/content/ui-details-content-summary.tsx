import { Grid } from '@mantine/core';
import type React from 'react';
import { UISpriteSizeWrapper } from '../../../sprite-img/ui-sprite-size-wrapper';

export type UIDetailsContentSummaryProps = {
    id: string;
    heldItem?: React.ReactNode;
    nature?: string;
    ability?: string;
    specialAbility?: boolean;
    pid?: number;
};

export const UIDetailsContentSummary: React.FC<UIDetailsContentSummaryProps> = ({
    id, heldItem, nature, ability, specialAbility, pid = 0
}) => {

    return <Grid>
        {heldItem && <>
            <Grid.Col span={4}>
                Held item
            </Grid.Col>
            <UISpriteSizeWrapper<typeof Grid.Col>
                itemSize='1lh'
                component={Grid.Col}
                span={8}
            >
                {heldItem}
            </UISpriteSizeWrapper>
        </>}

        {nature && <>
            <Grid.Col span={4}>
                Nature
            </Grid.Col>
            <Grid.Col span={8}>
                {nature}
            </Grid.Col>
        </>}

        {ability && <>
            <Grid.Col span={4}>
                {specialAbility
                    ? 'Special ability'
                    : 'Ability'}
            </Grid.Col>
            <Grid.Col span={8}>
                {ability}
            </Grid.Col>
        </>}

        {pid > 0 && <>
            <Grid.Col span={4}>
                PID
            </Grid.Col>
            <Grid.Col span={8}>
                {pid ?? '-'}
            </Grid.Col>
        </>}

        <Grid.Col span={4}>
            ID
        </Grid.Col>
        <Grid.Col span={8}>
            {id}
        </Grid.Col>
    </Grid>;
};
