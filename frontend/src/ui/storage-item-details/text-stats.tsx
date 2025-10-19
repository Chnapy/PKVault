import React from 'react';
import { useWatch } from 'react-hook-form';
import type { MoveCategory } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { Icon } from '../icon/icon';
import { NumberInput } from '../input/number-input';
import { MoveItem } from '../move-item/move-item';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';

export type TextStatsProps = {
    nature?: number;
    stats: number[];
    ivs: number[];
    evs: number[];
    maxEv: number;
    hiddenPowerType: number;
    hiddenPowerPower: number;
    hiddenPowerCategory: MoveCategory;
};

export const TextStats: React.FC<TextStatsProps> = ({
    nature,
    stats,
    ivs,
    evs,
    maxEv,
    hiddenPowerType,
    hiddenPowerPower,
    hiddenPowerCategory,
}) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const { editMode, getValues, register, control } = StorageDetailsForm.useContext();

    const natureObj = nature === undefined ? undefined : staticData.natures[ nature ];

    const totalIVs = ivs.reduce((acc, iv) => acc + iv, 0);
    const totalEVs = evs.reduce((acc, ev) => acc + ev, 0);
    const totalStats = stats.reduce((acc, stat) => acc + stat, 0);
    const totalFormEVs = useWatch({ name: 'eVs', control }).reduce((acc, ev) => acc + ev, 0);
    const remainingEVs = Math.max(totalEVs - totalFormEVs, 0);
    const formMaxValues = getValues('eVs').map(ev => Math.min(ev + remainingEVs, maxEv));

    const cellBaseStyle: React.CSSProperties = { padding: 0, textAlign: 'center' };

    const renderStatNameCell = (statName: string, i: number) => <td style={{ ...cellBaseStyle, textAlign: 'left' }}>
        {statName}{' '}
        {(i + 1) === natureObj?.decreasedStatIndex && <Icon name='angle-down' style={{ color: theme.text.red }} />}
        {(i + 1) === natureObj?.increasedStatIndex && <Icon name='angle-up' style={{ color: theme.text.primary }} />}
    </td>;

    return <>
        {natureObj && <>
            {t('details.nature')} <span style={{ color: theme.text.primary }}>{natureObj.name}</span>
            <br />
            <br />
        </>}

        <table
            style={{
                borderSpacing: '8px 0'
            }}
        >
            <thead>
                <tr>
                    <td style={cellBaseStyle}></td>
                    {!editMode && <td style={cellBaseStyle}>{t('details.stats.ivs')}</td>}
                    <td style={cellBaseStyle}>{t('details.stats.evs')}</td>
                    {!editMode && <td style={cellBaseStyle}>{t('details.stats.name')}</td>}
                </tr>
            </thead>
            <tbody>
                {[ t('details.stats.hp'), t('details.stats.atk'), t('details.stats.def'), t('details.stats.spa'), t('details.stats.spd'), t('details.stats.spe') ]
                    .map((statName, i) => editMode
                        ? <tr key={statName}>
                            {renderStatNameCell(statName, i)}
                            <td style={cellBaseStyle}>
                                <NumberInput {...register(`eVs.${i}`, {
                                    valueAsNumber: true,
                                    min: 0,
                                    max: formMaxValues[ i ]
                                })} rangeMin={0} rangeMax={formMaxValues[ i ]} style={{ display: 'flex', height: '1lh' }} />
                            </td>
                        </tr>
                        : <tr key={statName}>
                            {renderStatNameCell(statName, i)}
                            <td style={cellBaseStyle}>{ivs[ i ]}</td>
                            <td style={cellBaseStyle}>{evs[ i ]}</td>
                            <td style={cellBaseStyle}>{stats[ i ]}</td>
                        </tr>)}

                {editMode
                    ? <tr>
                        <td style={{ ...cellBaseStyle, textAlign: 'left', textTransform: 'capitalize' }}>{t('total')}</td>
                        <td style={cellBaseStyle}>{totalFormEVs} / {totalEVs}</td>
                    </tr>
                    : <tr>
                        <td style={{ ...cellBaseStyle, textAlign: 'left', textTransform: 'capitalize' }}>{t('total')}</td>
                        <td style={cellBaseStyle}>{totalIVs}</td>
                        <td style={cellBaseStyle}>{totalEVs}</td>
                        <td style={cellBaseStyle}>{totalStats}</td>
                    </tr>}
            </tbody>
        </table>
        <br />
        <MoveItem
            name={staticData.moves[ 237 ]?.name ?? ''}
            type={hiddenPowerType}
            damage={hiddenPowerPower}
            category={hiddenPowerCategory}
            style={{
                display: 'inline-block',
                verticalAlign: 'bottom'
            }}
        />
    </>;
};
