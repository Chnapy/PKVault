import type React from 'react';
import type { GameVersion, Gender as GenderType } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Gender } from '../gender/gender';
import { theme } from '../theme';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { useTranslate } from '../../translate/i18n';
import { DetailsLevel } from '../details-card/details-level';
import { css } from '@emotion/css';

export type TextOriginProps = {
    version: GameVersion | null;
    tid: number;
    originTrainerName: string;
    originTrainerGender: GenderType;
    originMetDate?: string;
    originMetLocation: string;
    originMetLevel?: number;
};

export const TextOrigin: React.FC<TextOriginProps> = ({
    version,
    tid,
    originTrainerName,
    originTrainerGender,
    originMetDate,
    originMetLocation,
    originMetLevel,
}) => {
    const { t } = useTranslate();

    const { versions } = useStaticData();

    const gameinfos = getGameInfos(version);

    return <>
        <span className={css({ color: theme.text.primary })}>{t('details.origin')}</span>
        <br />
        <img
            src={gameinfos.img}
            className={css({
                height: '1lh',
                width: '1lh',
                verticalAlign: 'middle'
            })}
        /> <span className={css({ color: theme.text.primary })}>{t('save.pkm')} {versions[ version ?? -1 ]?.name}</span>
        <br />
        {t('save.ot')} <span className={css({ color: theme.text.primary })}>{originTrainerName}</span> <Gender gender={originTrainerGender} /> - {t('details.tid')} <span className={css({ color: theme.text.primary })}>{tid}</span>
        <br />
        {originMetLocation}{originMetLevel ? <> - <DetailsLevel level={originMetLevel} /></> : null}
    </>;
};
