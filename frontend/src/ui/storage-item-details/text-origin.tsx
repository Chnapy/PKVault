import { css } from '@emotion/css';
import type React from 'react';
import type { GameVersion, Gender as GenderType } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { useTranslate } from '../../translate/i18n';
import { DetailsLevel } from '../details-card/details-level';
import { Gender } from '../gender/gender';
import { DOLine } from '../save-card/do-line';
import { theme } from '../theme';
import { renderDate } from '../util/render-date-time';

export type TextOriginProps = {
    version: GameVersion | null;
    tid: number;
    sid?: number;
    originTrainerName: string;
    originTrainerGender: GenderType;
    handlingTrainerName: string;
    handlingTrainerGender: GenderType;
    isCurrentHandler: boolean;
    originMetDate?: string;
    originMetLocation: string;
    originMetLevel?: number;
    fatefulEncounter: boolean;
};

export const TextOrigin: React.FC<TextOriginProps> = ({
    version,
    tid,
    sid,
    originTrainerName,
    originTrainerGender,
    handlingTrainerName,
    handlingTrainerGender,
    isCurrentHandler,
    originMetDate,
    originMetLocation,
    originMetLevel,
    fatefulEncounter,
}) => {
    const { t } = useTranslate();

    const { versions } = useStaticData();

    const gameinfos = getGameInfos(version);

    return <>
        {isCurrentHandler && <>
            {t('details.ht')} <span className={css({ color: theme.text.primary })}>{handlingTrainerName}</span> <Gender gender={handlingTrainerGender} />
            <br />
            <br />
        </>}
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
        <DOLine
            tid={tid}
            sid={sid}
            originTrainerName={originTrainerName}
            originTrainerGender={originTrainerGender}
        />
        <br />
        {originMetLocation}
        {originMetLevel ? <> - <DetailsLevel level={originMetLevel} /></> : null}
        {originMetDate ? <> - {renderDate(new Date(originMetDate))}</> : null}
        {fatefulEncounter && <> - {t('details.fateful')}</>}
    </>;
};
