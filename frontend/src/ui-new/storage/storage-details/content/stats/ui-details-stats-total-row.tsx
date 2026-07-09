import { Badge, Group, Progress, Table } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../../../translate/i18n';

export type UIDetailsStatsTotalRowProps = {
    total: number;
    level: number;
    iv?: number;
    ev?: number;
};

export const UIDetailsStatsTotalRow: React.FC<UIDetailsStatsTotalRowProps> = ({ total, level, iv, ev }) => {
    const { t } = useTranslate();

    const maxStats = 500 * 6;
    const minStats = 5 * 6;

    const maxStatsRatio = minStats + (maxStats - minStats) * (level / 100);
    const progressValue = total / maxStatsRatio * 100;

    return <Table.Tr style={{
        borderTop: '1px solid var(--mantine-color-gray-3)',
    }}>
        <Table.Th>
            <Group wrap='nowrap' gap='xs'>
                {t('total')}
            </Group>
        </Table.Th>
        <Table.Td>
            <Progress
                value={progressValue}
                color='primary'
                style={{ alignSelf: 'stretch', justifySelf: 'stretch', flexGrow: 1 }}
            />
        </Table.Td>
        <Table.Td>
            {total}
        </Table.Td>
        {iv !== undefined && <Table.Td>
            <Badge
                variant='outline'
                color={`rgb(${255 - (255 * iv / (31 * 6))},${255 * iv / (31 * 6)},0)`}
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
                color={`rgb(${255 - (255 * ev / (252 * 6))},${255 * ev / (252 * 6)},0)`}
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
