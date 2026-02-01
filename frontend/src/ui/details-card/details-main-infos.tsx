import { css } from '@emotion/css';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { getSpeciesNO } from '../dex-item/util/get-species-no';
import { Gauge } from '../gauge/gauge';
import { theme } from '../theme';
import { TypeItem } from '../type-item/type-item';
import { DetailsLevel } from './details-level';

export type DetailsMainInfosProps = {
    idBase?: string;
    pid?: number;
    species: number;
    speciesName: React.ReactNode;
    nickname?: React.ReactNode;
    types: number[];
    levelUpPercent?: number;
    level?: number;
    eggHatchCount?: number;
};

export const DetailsMainInfos: React.FC<DetailsMainInfosProps> = ({ idBase, pid = 0, species, speciesName, nickname, types, levelUpPercent, level, eggHatchCount = 0 }) => {
    const { t } = useTranslate();

    return <>
        {nickname && <>{nickname}{' - '}</>}
        <span className={css({ color: theme.text.primary })}>{speciesName}</span>

        <br />
        <div className={css({ display: 'flex', gap: 4, height: '1lh' })}>
            {types.map(type => <TypeItem key={type} type={type} />)}

            {(level !== undefined || eggHatchCount > 0) && <div className={css({
                flexGrow: 1,
                color: theme.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            })}>
                {eggHatchCount > 0
                    ? <>
                        <Gauge
                            className={css({ marginLeft: 'auto' })}
                            value={eggHatchCount / 255}
                        />

                        {eggHatchCount}
                    </>
                    : level !== undefined && <>
                        {levelUpPercent !== undefined
                            ? <Gauge
                                className={css({ marginLeft: 'auto' })}
                                value={levelUpPercent}
                            />
                            : <div className={css({
                                flexGrow: 1,
                            })} />}

                        <DetailsLevel level={level} />
                    </>}
            </div>}
        </div>
        <br />
        {t('details.dex.local')}<span className={css({ color: theme.text.primary })}>TODO</span>{' '}
        {t('details.dex.natio')}<span className={css({ color: theme.text.primary })}>{getSpeciesNO(species)}</span>
        <br />
        {idBase !== undefined ? <>
            {t('details.id')} <span className={css({ color: theme.text.primary })}>{idBase}</span> {pid > 0 && <>{t('details.pid')} <span className={css({ color: theme.text.primary })}>{pid}</span></>}
        </> : ' '}
    </>;
};
