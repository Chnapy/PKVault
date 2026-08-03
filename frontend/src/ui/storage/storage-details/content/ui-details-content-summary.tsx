import { Box, Grid } from '@mantine/core';
import type React from 'react';
import { UISpriteSizeWrapper } from '../../../sprite-img/ui-sprite-size-wrapper';
import { useTranslate } from '../../../../translate/i18n';

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
    const { t } = useTranslate();

    return <Grid>
        {heldItem && <>
            <Grid.Col span={4}>
                {t('details.held-item')}
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
                {t('details.nature')}
            </Grid.Col>
            <Grid.Col span={8}>
                {nature}
            </Grid.Col>
        </>}

        {ability && <>
            <Grid.Col span={4}>
                {specialAbility
                    ? t('details.ability.old')
                    : t('details.ability')}
            </Grid.Col>
            <Grid.Col span={8}>
                {ability}
            </Grid.Col>
        </>}

        {pid > 0 && <>
            <Grid.Col span={4}>
                {t('details.pid')}
            </Grid.Col>
            <Grid.Col span={8}>
                {pid ?? '-'}
            </Grid.Col>
        </>}

        <Grid.Col span={4}>
            {t('details.id')}
        </Grid.Col>
        <Grid.Col span={8}>
            <Box style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {id}
            </Box>
        </Grid.Col>
    </Grid>;
};
