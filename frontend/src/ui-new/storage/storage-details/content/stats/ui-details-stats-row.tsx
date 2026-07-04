import { Badge, Group, Progress, Table } from '@mantine/core';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../../translate/i18n';

const statsInfos = {
    hp: {
        color: '#4caf70',
    },
    atk: {
        color: '#f08030',
    },
    def: {
        color: '#f0c030',
    },
    spa: {
        color: '#6890f0',
    },
    spd: {
        color: '#78c850',
    },
    spe: {
        color: '#f85888',
    },
};

export type UIDetailsStatName = keyof typeof statsInfos;

export type UIDetailsStatsRowProps = {
    stat: UIDetailsStatName;
    value: number;
    natureEffect?: 'increase' | 'decrease';
    iv?: number;
    ev?: number;
};

export const UIDetailsStatsRow: React.FC<UIDetailsStatsRowProps> = ({ stat, value, natureEffect, iv, ev }) => {
    const { t } = useTranslate();

    const { color } = statsInfos[ stat ];

    const name = t(`details.stats.${stat}`);

    const level = 50;
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
