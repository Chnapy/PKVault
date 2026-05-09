import { Progress, Table } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { theme } from '../../../theme';

type ContestProps = {
    index: number;
    value: number;
};

export const UIContest: React.FC<ContestProps> = ({ index, value }) => {
    const { t } = useTranslate();

    const getContestInfo = (index: number) => {
        switch (index) {
            case 0: return {
                color: theme.other?.contest?.cool,
                label: t('details.contest.cool'),
            };
            case 1: return {
                color: theme.other?.contest?.beauty,
                label: t('details.contest.beauty'),
            };
            case 2: return {
                color: theme.other?.contest?.cute,
                label: t('details.contest.cute'),
            };
            case 3: return {
                color: theme.other?.contest?.smart,
                label: t('details.contest.smart'),
            };
            case 4: return {
                color: theme.other?.contest?.tough,
                label: t('details.contest.tough'),
            };
            case 5: return {
                color: 'dark',
                label: t('details.contest.sheen'),
            };
            default: return {};
        }
    };

    const { color, label } = getContestInfo(index);

    return <Table.Tr>
        <Table.Th>
            {label}
        </Table.Th>
        <Table.Td align='center'>
            <Progress
                value={value / 255 * 100}
                color={color}
                style={{ alignSelf: 'stretch', justifySelf: 'stretch', flexGrow: 1 }}
            />
        </Table.Td>
        <Table.Td>
            {value}
        </Table.Td>
    </Table.Tr>;
};
