import { css } from '@emotion/css';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { getSpeciesNO } from '../dex-item/util/get-species-no';
import { theme } from '../theme';
import { TypeItem } from '../type-item/type-item';
import { DetailsLevel } from './details-level';

export type DetailsMainInfosProps = {
    idBase?: string;
    pid?: number;
    species: number;
    speciesName: React.ReactNode;
    nickname?: React.ReactNode;
    // genders: GenderType[];
    types: number[];
    levelUpPercent?: number;
    level?: number;
};

export const DetailsMainInfos: React.FC<DetailsMainInfosProps> = ({ idBase, pid = 0, species, speciesName, nickname, types, levelUpPercent, level }) => {
    const { t } = useTranslate();

    return <>
        {nickname && <>{nickname}{' - '}</>}
        <span style={{ color: theme.text.primary }}>{speciesName}</span>

        {/* {genders.map(gender => <span
            key={gender}
            style={{
                float: 'right',
            }}
        >
            <Gender gender={gender} />
        </span>)} */}
        <br />
        <div style={{ display: 'flex', gap: 4, height: '1lh' }}>
            {types.map(type => <TypeItem key={type} type={type} />)}
            {level !== undefined && <div style={{
                marginLeft: 'auto',
                color: theme.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            }}>
                {levelUpPercent !== undefined && <div
                    title={`${(levelUpPercent * 100).toFixed(0)}%`}
                    className={css({
                        width: 60,
                        height: 6,
                        display: 'inline-flex',
                        border: `1px solid ${theme.border.default}`,
                        borderRadius: 2,
                    })}
                >
                    <div
                        className={css({
                            height: '100%',
                            backgroundColor: theme.bg.primary,
                        })}
                        style={{ width: `${levelUpPercent * 100}%` }}
                    />
                </div>}

                <DetailsLevel level={level} />
            </div>}
        </div>
        <br />
        {t('details.dex.local')}<span style={{ color: theme.text.primary }}>TODO</span>{' '}
        {t('details.dex.natio')}<span style={{ color: theme.text.primary }}>{getSpeciesNO(species)}</span>
        <br />
        {idBase !== undefined ? <>
            {t('details.id')} <span style={{ color: theme.text.primary }}>{idBase}</span> {pid > 0 && <>{t('details.pid')} <span style={{ color: theme.text.primary }}>{pid}</span></>}
        </> : ' '}
    </>;
};
