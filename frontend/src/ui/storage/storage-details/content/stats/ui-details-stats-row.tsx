import { Box, Group, NumberFormatter, Progress, Table } from '@mantine/core';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../../translate/i18n';
import { switchUtil } from '../../../../../util/switch-util';
import { baseTheme } from '../../../../base-theme';
import classes from './ui-details-content-stats.module.css';

export type UIDetailsStatName = keyof typeof baseTheme.other.stats;

export type UIDetailsStatsRowProps = {
    stat: UIDetailsStatName;
    value: number;
    level: number;
    natureEffect?: 'increase' | 'decrease';
    maxIv?: number;
    maxEv?: number;
    iv?: number;
    ev?: number;
};

export const UIDetailsStatsRow: React.FC<UIDetailsStatsRowProps> = ({ stat, value, level, natureEffect, maxIv, maxEv, iv, ev }) => {
    const { t } = useTranslate();

    const color = baseTheme.other.stats[ stat ];

    const name = switchUtil(stat, {
        'hp': t('details.stats.hp'),
        'atk': t('details.stats.atk'),
        'def': t('details.stats.def'),
        'spa': t('details.stats.spa'),
        'spd': t('details.stats.spd'),
        'spe': t('details.stats.spe'),
    });

    const maxStats = 400;
    const minStats = 5;

    const maxStatsRatio = minStats + (maxStats - minStats) * (level / 100);
    const progressValue = value / maxStatsRatio * 100;

    return <Table.Tr>
        <Table.Th>
            <Group wrap='nowrap' gap='xs'>
                {name}
                {natureEffect === 'decrease' && <ChevronDownIcon strokeWidth={3} color='var(--mantine-color-blue-filled)' style={{ marginLeft: 'auto' }} />}
                {natureEffect === 'increase' && <ChevronUpIcon strokeWidth={3} color='var(--mantine-color-red-filled)' style={{ marginLeft: 'auto' }} />}
            </Group>
        </Table.Th>
        <Table.Td>
            <Progress
                value={progressValue}
                color={color}
                style={{ alignSelf: 'stretch', justifySelf: 'stretch', flexGrow: 1 }}
            />
        </Table.Td>
        <Table.Td>
            {value}
        </Table.Td>
        {iv !== undefined && maxIv !== undefined && <Table.Td>
            <Box className={classes.ivEv}>
                {iv}
                <Progress
                    className={classes.ivEvBar}
                    color='green'
                    value={100 * iv / maxIv}
                    size={4}
                    animated={iv >= maxIv}
                />
            </Box>
        </Table.Td>}
        {ev !== undefined && maxEv !== undefined && <Table.Td>
            <Box className={classes.ivEv}>
                <NumberFormatter value={ev} />
                <Progress
                    className={classes.ivEvBar}
                    color='blue'
                    value={100 * ev / maxEv}
                    size={4}
                    animated={ev >= maxEv}
                />
            </Box>
        </Table.Td>}
    </Table.Tr>;
};
