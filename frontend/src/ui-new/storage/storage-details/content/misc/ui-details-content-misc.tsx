import { Grid } from '@mantine/core';
import React from 'react';
import { useTranslate } from '../../../../../translate/i18n';

export type UIDetailsContentMiscProps = {
    language: string;
    homeTracker?: number;
};

export const UIDetailsContentMisc: React.FC<UIDetailsContentMiscProps> = ({
    language, homeTracker
}) => {
    const { t } = useTranslate();

    return <Grid>
        <Grid.Col span={4}>
            Language
        </Grid.Col>
        <Grid.Col span={8}>
            {language}
        </Grid.Col>

        <Grid.Col span={4}>
            Home tracker
        </Grid.Col>
        <Grid.Col span={8}>
            {homeTracker}
        </Grid.Col>
    </Grid>;
};
