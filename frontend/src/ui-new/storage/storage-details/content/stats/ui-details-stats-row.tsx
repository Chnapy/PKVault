import { Badge, Group, Progress, Table } from '@mantine/core';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../../translate/i18n';
import { baseTheme } from '../../../../base-theme';

export type UIDetailsStatName = keyof typeof baseTheme.other.stats;

export type UIDetailsStatsRowProps = {
    stat: UIDetailsStatName;
    value: number;
    level: number;
    natureEffect?: 'increase' | 'decrease';
    iv?: number;
    ev?: number;
};

export const UIDetailsStatsRow: React.FC<UIDetailsStatsRowProps> = ({ stat, value, level, natureEffect, iv, ev }) => {
    const { t } = useTranslate();

    const color = baseTheme.other.stats[ stat ];

    const name = t(`details.stats.${stat}`);

    const maxStats = 500;
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
        {iv !== undefined && <Table.Td>
            <Badge
                variant='outline'
                color={`rgb(${255 - (255 * iv / 31)},${255 * iv / 31},0)`}
                c='inherit'
                radius='sm'
                miw='100%'
                styles={{
                    label: {
                        minWidth: 'fit-content',
                    }
                }}
            >
                {iv}
            </Badge>
        </Table.Td>}
        {ev !== undefined && <Table.Td>
            <Badge
                variant='outline'
                color={`rgb(${255 - (255 * ev / 252)},${255 * ev / 252},0)`}
                c='inherit'
                radius='sm'
                miw='100%'
                styles={{
                    label: {
                        minWidth: 'fit-content',
                    }
                }}
            >
                {ev}
            </Badge>
        </Table.Td>}
    </Table.Tr>;
};
