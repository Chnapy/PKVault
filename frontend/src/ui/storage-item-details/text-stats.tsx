import React from 'react';
import { useWatch } from 'react-hook-form';
import { Button } from '../button/button';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';

export type TextStatsProps = {
    nature?: string;
    stats: number[];
    ivs: number[];
    evs: number[];
    hiddenPowerType: string;
    hiddenPowerPower: number;
};

export const TextStats: React.FC<TextStatsProps> = ({
    nature,
    stats,
    ivs,
    evs,
    hiddenPowerType,
    hiddenPowerPower,
}) => {
    const { editMode, setValue, register, control } = StorageDetailsForm.useContext();

    const totalEVs = evs.reduce((acc, ev) => acc + ev, 0);
    const totalFormEVs = useWatch({ name: 'eVs', control }).reduce((acc, ev) => acc + ev, 0);

    return <>
        {nature && <>
            Nature <span style={{ color: theme.text.primary }}>{nature}</span>
            <br />
        </>}

        <table>
            <thead>
                <tr>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}></td>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>HP.</td>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>Atk</td>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>Def</td>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>SpA</td>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>SpD</td>
                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>Spe</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ padding: 0 }}>
                        <span style={{ color: theme.text.primary }}>IVs</span>
                    </td>
                    {ivs.map((iv, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{iv}</td>)}
                </tr>
                <tr>
                    <td style={{ padding: 0 }}>
                        <span style={{ color: theme.text.primary }}>EVs</span>
                    </td>
                    {editMode
                        ? <>
                            {evs.map((ev, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>
                                <input
                                    type='number'
                                    {...register(`eVs.${i}`, { valueAsNumber: true })}
                                    style={{ width: 50, padding: 0, textAlign: 'center' }}
                                />
                            </td>)}

                            <td style={{ padding: 0, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {totalFormEVs}/{totalEVs}
                            </td>
                        </>
                        : <>
                            {evs.map((ev, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{ev}</td>)}
                            <td style={{ padding: 0, textAlign: 'center' }}>
                                <Button onClick={() => setValue('editMode', true)}>Edit</Button>
                            </td>
                        </>}
                </tr>
                {!editMode && <tr>
                    <td style={{ padding: 0 }}>
                        <span style={{ color: theme.text.primary }}>Stats</span>
                    </td>
                    {stats.map((stat, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{stat}</td>)}
                </tr>}
            </tbody>
        </table>
        <br />
        Hidden power <span style={{ color: theme.text.primary }}>{hiddenPowerType}</span> - <span style={{ color: theme.text.primary }}>{hiddenPowerPower}</span>
    </>;
};
