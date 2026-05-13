import { Grid, Group } from '@mantine/core';
import React from 'react';
import { Gender } from '../../../../../data/sdk/model';
import { useTranslate } from '../../../../../translate/i18n';
import { renderDate } from '../../../../../ui/util/render-date-time';
import { UIGender } from '../../../../icon/ui-gender';
import { UIDetailsLevel } from '../../ui-details-level';

export type UIDetailsContentOriginProps = {
    game: React.ReactNode;
    ot: string;
    otGender: Gender;
    ht?: string;
    htGender?: Gender;
    tid: number;
    sid?: number;

    originMetLocation?: string;
    originMetLevel?: number;
    originMetDate?: string;
    fatefulEncounter?: boolean;
};

export const UIDetailsContentOrigin: React.FC<UIDetailsContentOriginProps> = ({
    game, ot, otGender, ht, htGender, tid, sid,
    originMetLocation, originMetLevel, originMetDate, fatefulEncounter,
}) => {
    const { t } = useTranslate();

    return <Grid>
        <Grid.Col span={4}>
            Game
        </Grid.Col>
        <Grid.Col span={8}>
            {game}
        </Grid.Col>

        {ht && <>
            <Grid.Col span={4}>
                HT
            </Grid.Col>
            <Grid.Col span={8}>
                <Group>
                    {ht}
                    {htGender && <UIGender gender={htGender} />}
                </Group>
            </Grid.Col>
        </>}

        <Grid.Col span={4}>
            OT
        </Grid.Col>
        <Grid.Col span={8}>
            <Group>
                {ot}
                <UIGender gender={otGender} />
            </Group>
        </Grid.Col>

        <Grid.Col span={4}>
            TID
        </Grid.Col>
        <Grid.Col span={8}>
            {tid}
        </Grid.Col>

        <Grid.Col span={4}>
            SID
        </Grid.Col>
        <Grid.Col span={8}>
            {sid ?? '-'}
        </Grid.Col>

        <Grid.Col span={4}>
            Location
        </Grid.Col>
        <Grid.Col span={8}>
            {[
                originMetLocation,
                typeof originMetLevel === 'number' && <UIDetailsLevel level={originMetLevel} />,
                originMetDate && renderDate(new Date(originMetDate)),
                fatefulEncounter && t('details.fateful')
            ].filter(Boolean)
                .map((item, i) => <React.Fragment key={i}>
                    {i ? ' - ' : undefined}
                    {item}
                </React.Fragment>)}
        </Grid.Col>
    </Grid>;
};
