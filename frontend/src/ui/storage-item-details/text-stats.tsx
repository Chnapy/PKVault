import React from 'react';
import { useWatch } from 'react-hook-form';
import type { MoveCategory } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { NumberInput } from '../input/number-input';
import { MoveItem } from '../move-item/move-item';
import { RadarChart } from '../radar-chart/radar-chart';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';
import { css, cx } from '@emotion/css';

export type TextStatsProps = {
    nature?: number;
    stats: number[];
    ivs: number[];
    maxIv: number;
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
    maxIv,
    evs,
    maxEv,
    hiddenPowerType,
    hiddenPowerPower,
    hiddenPowerCategory,
}) => {
    const [ showTable, setShowTable ] = React.useState(false);
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

    const cellBaseClassName = css({ padding: 0, textAlign: 'center' });

    const renderStatNameCell = (statName: string, i: number) => <td className={cx(cellBaseClassName, css({ textAlign: 'left' }))}>
        {statName}{' '}
        {(i + 1) === natureObj?.decreasedStatIndex && <Icon name='angle-down' className={css({ color: theme.text.red })} />}
        {(i + 1) === natureObj?.increasedStatIndex && <Icon name='angle-up' className={css({ color: theme.text.primary })} />}
    </td>;

    const maxStatValue = Math.max(...stats, 350);

    const dataMax = [
        ivs.map(() => maxIv),
        evs.map(() => maxEv),
        stats.map(() => maxStatValue),
    ];
    const data = [
        ivs,
        evs,
        stats,
    ];
    const legend = [ t('details.stats.hp'), t('details.stats.atk'), t('details.stats.def'), t('details.stats.spa'), t('details.stats.spd'), t('details.stats.spe') ]
        .map((label, i) => <React.Fragment key={label}>
            {label}
            {(i + 1) === natureObj?.decreasedStatIndex && <Icon name='angle-down' className={css({ color: theme.text.red })} />}
            {(i + 1) === natureObj?.increasedStatIndex && <Icon name='angle-up' className={css({ color: theme.text.primary })} />}
        </React.Fragment>)
    const labels = [ t('details.stats.ivs'), t('details.stats.evs'), t('details.stats.name') ];
    const colors = [ theme.bg.yellow, theme.bg.green, theme.bg.primary ];

    return <>
        {natureObj && <>
            {t('details.nature')} <span className={css({ color: theme.text.primary })}>{natureObj.name}</span>
            <br />
            <br />
        </>}

        <div className={css({ display: 'inline-flex', height: '1lh' })}>
            <Button
                onClick={() => setShowTable(false)}
                disabled={!showTable}
                className={css({
                    height: 26,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                })}
            >
                <Icon name='chart-network' forButton />
            </Button>
            <Button
                onClick={() => setShowTable(true)}
                disabled={showTable}
                className={css({
                    height: 26,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                })}
            >
                <Icon name='table' solid forButton />
            </Button>
        </div>

        {showTable
            ? (
                <table
                    className={css({
                        borderSpacing: '8px 0'
                    })}
                >
                    <thead>
                        <tr>
                            <td className={cellBaseClassName}></td>
                            {!editMode && <td className={cellBaseClassName}>{t('details.stats.ivs')}</td>}
                            <td className={cellBaseClassName}>{t('details.stats.evs')}</td>
                            {!editMode && <td className={cellBaseClassName}>{t('details.stats.name')}</td>}
                        </tr>
                    </thead>
                    <tbody>
                        {[ t('details.stats.hp'), t('details.stats.atk'), t('details.stats.def'), t('details.stats.spa'), t('details.stats.spd'), t('details.stats.spe') ]
                            .map((statName, i) => editMode
                                ? <tr key={statName}>
                                    {renderStatNameCell(statName, i)}
                                    <td className={cellBaseClassName}>
                                        <NumberInput {...register(`eVs.${i}`, {
                                            valueAsNumber: true,
                                            min: 0,
                                            max: formMaxValues[ i ]
                                        })} rangeMin={0} rangeMax={formMaxValues[ i ]} className={css({ display: 'flex', height: '1lh' })} />
                                    </td>
                                </tr>
                                : <tr key={statName}>
                                    {renderStatNameCell(statName, i)}
                                    <td className={cellBaseClassName}>{ivs[ i ]}</td>
                                    <td className={cellBaseClassName}>{evs[ i ]}</td>
                                    <td className={cellBaseClassName}>{stats[ i ]}</td>
                                </tr>)}

                        {editMode
                            ? <tr>
                                <td className={cx(cellBaseClassName, css({ textAlign: 'left', textTransform: 'capitalize' }))}>{t('total')}</td>
                                <td className={cellBaseClassName}>{totalFormEVs} / {totalEVs}</td>
                            </tr>
                            : <tr>
                                <td className={cx(cellBaseClassName, css({ textAlign: 'left', textTransform: 'capitalize' }))}>{t('total')}</td>
                                <td className={cellBaseClassName}>{totalIVs}</td>
                                <td className={cellBaseClassName}>{totalEVs}</td>
                                <td className={cellBaseClassName}>{totalStats}</td>
                            </tr>}
                    </tbody>
                </table>
            )
            : <div className={css({
                display: 'flex',
                justifyContent: 'center',
                marginTop: -26
            })}>
                <RadarChart
                    width={300}
                    data={data}
                    dataMax={dataMax}
                    legend={legend}
                    labels={labels}
                    colors={colors}
                />
            </div>
        }

        <br />
        <MoveItem
            name={staticData.moves[ 237 ]?.name ?? ''}
            type={hiddenPowerType}
            damage={hiddenPowerPower}
            category={hiddenPowerCategory}
            className={css({
                display: 'inline-block',
                verticalAlign: 'bottom'
            })}
        />
    </>;
};
