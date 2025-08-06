import type React from 'react';
import { theme } from '../theme';

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
                    {evs.map((ev, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{ev}</td>)}
                </tr>
                <tr>
                    <td style={{ padding: 0 }}>
                        <span style={{ color: theme.text.primary }}>Stats</span>
                    </td>
                    {stats.map((stat, i) => <td key={i} style={{ padding: 0, textAlign: 'center' }}>{stat}</td>)}
                </tr>
            </tbody>
        </table>
        <br />
        Hidden power <span style={{ color: theme.text.primary }}>{hiddenPowerType}</span> - <span style={{ color: theme.text.primary }}>{hiddenPowerPower}</span>
    </>;
};
