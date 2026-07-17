import { Box, Group, Progress, Table } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../../../translate/i18n';
import classes from './ui-details-content-stats.module.css';

export type UIDetailsStatsTotalRowProps = {
    total: number;
    level: number;
    maxIv?: number;
    iv?: number;
    ev?: number;
};

export const UIDetailsStatsTotalRow: React.FC<UIDetailsStatsTotalRowProps> = ({ total, level, maxIv, iv, ev }) => {
    const { t } = useTranslate();

    const maxStats = 400 * 6;
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
        {iv !== undefined && maxIv !== undefined && <Table.Td>
            <Box className={classes.ivEv}>
                {iv}
                <Progress
                    className={classes.ivEvBar}
                    color='green'
                    value={100 * iv / (maxIv * 6)}
                    size={4}
                    animated={iv >= (maxIv * 6)}
                />
            </Box>
        </Table.Td>}
        {ev !== undefined && <Table.Td>
            <Box className={classes.ivEv}>
                {ev}
                <Progress
                    className={classes.ivEvBar}
                    color='blue'
                    value={100 * ev / 510}
                    size={4}
                    animated={ev >= 510}
                />
            </Box>
        </Table.Td>}
    </Table.Tr>;
};
