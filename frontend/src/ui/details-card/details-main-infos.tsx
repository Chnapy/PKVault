import { css } from '@emotion/css';
import React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { getSpeciesNO } from '../dex-item/util/get-species-no';
import { Gauge } from '../gauge/gauge';
import { PokerusIcon } from '../icon/pokerus-icon';
import { theme } from '../theme';
import { TypeItem } from '../type-item/type-item';
import { DetailsLevel } from './details-level';

export type DetailsMainInfosProps = {
    idBase?: string;
    pid?: number;
    species: number;
    speciesName: React.ReactNode;
    version: GameVersion;
    nickname?: React.ReactNode;
    types: number[];
    levelUpPercent?: number;
    level?: number;
    eggHatchCount?: number;
    pokerusDays?: number;
    isPokerusCured?: boolean;
};

export const DetailsMainInfos: React.FC<DetailsMainInfosProps> = ({
    idBase, pid = 0, species, speciesName, version, nickname, types, levelUpPercent, level, eggHatchCount = 0, pokerusDays = 0, isPokerusCured
}) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const dexIndexes = staticData.versions[ version ]?.pokedexes
        .map(dexKey => ({
            key: dexKey,
            name: staticData.pokedexes[ dexKey ]?.name,
            value: staticData.species[ species ]?.pokedexIndexes[ dexKey ] ?? 0
        }))
        .filter(dexIndex => dexIndex.value > 0) ?? [];
    const [ mainDexIndex, ...otherDexIndexes ] = dexIndexes;

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
        <div className={css({ display: 'flex', justifyContent: 'flex-end' })}>
            {pokerusDays > 0
                ? <PokerusIcon title={t('details.pokerus.infected', { days: pokerusDays })} />
                : (isPokerusCured && <PokerusIcon cured title={t('details.pokerus.cured')} />)}
        </div>
        <br />
        {t('details.dex')}
        <details className={css({
            display: 'inline-block',
            verticalAlign: 'top',
            marginLeft: 4
        })}>
            <summary className={css({
                cursor: otherDexIndexes.length > 0 ? 'pointer' : undefined,
                pointerEvents: otherDexIndexes.length === 0 ? 'none' : undefined,
                height: 19,

                '&::marker': {
                    fontSize: otherDexIndexes.length > 0 ? '80%' : 0,
                }
            })}>
                {mainDexIndex!.name}
                <span className={css({
                    marginLeft: 4,
                    float: 'right',
                    color: theme.text.primary
                })}>
                    {getSpeciesNO(mainDexIndex!.value)}
                </span>
            </summary>

            <div className={css({
                paddingLeft: 13.44,
            })}>
                {otherDexIndexes.map((dexIndex, i) => <React.Fragment key={dexIndex.key}>
                    {i ? <br /> : null}
                    {dexIndex.name}
                    <span className={css({
                        marginLeft: 4,
                        float: 'right',
                        color: theme.text.primary
                    })}>
                        {getSpeciesNO(dexIndex.value)}
                    </span>
                </React.Fragment>)}
            </div>
        </details>

        {idBase !== undefined && <>
            <br />
            {t('details.id')} <span className={css({ color: theme.text.primary })}>{idBase}</span> {pid > 0 && <>{t('details.pid')} <span className={css({ color: theme.text.primary })}>{pid}</span></>}
        </>}
    </>;
};
