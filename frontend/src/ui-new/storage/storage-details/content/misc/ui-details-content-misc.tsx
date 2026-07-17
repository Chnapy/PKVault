import { Grid, Progress } from '@mantine/core';
import React from 'react';

export type UIDetailsContentMiscProps = {
    isEgg?: boolean;
    eggHatchCount: number;
    friendship: number;
    language: string | undefined;
    homeTracker?: number;
};

export const UIDetailsContentMisc: React.FC<UIDetailsContentMiscProps> = ({
    isEgg, eggHatchCount, friendship, language, homeTracker
}) => {
    // const { t } = useTranslate();

    return <Grid>
        <Grid.Col span={4}>
            {isEgg ? 'Hatchcount' : 'Friendship'}
        </Grid.Col>
        <Grid.Col span={6} display='flex' align='center'>
            <Progress
                value={
                    (isEgg ? eggHatchCount : friendship)
                    / 255 * 100
                }
                // color={color}
                animated={friendship >= 255}
                style={{ flexGrow: 1 }}
            />
        </Grid.Col>
        <Grid.Col span={2}>
            {isEgg ? eggHatchCount : friendship}
        </Grid.Col>

        <Grid.Col span={4}>
            Language
        </Grid.Col>
        <Grid.Col span={8}>
            {language ?? '-'}
        </Grid.Col>

        <Grid.Col span={4}>
            Home tracker
        </Grid.Col>
        <Grid.Col span={8}>
            {homeTracker ?? '-'}
        </Grid.Col>
    </Grid>;
};
