import { Box, Group, NumberFormatter, Text } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../translate/i18n';

export type UIStoragePanelFooterProps = {
    boxSize: number;
    pkmCount: number;
    pkmTotalCount: number;
};

export const UIStoragePanelFooter: React.FC<UIStoragePanelFooterProps> = ({ boxSize, pkmCount, pkmTotalCount }) => {
    const { t } = useTranslate();

    return <Text component="div" size='sm'>
        <Group justify='space-between'>
            <div />
            <Box>
                <NumberFormatter value={pkmCount} />/<NumberFormatter value={boxSize} />
            </Box>
            <Box>
                {t('total')} <NumberFormatter value={pkmTotalCount} />
            </Box>
        </Group>
    </Text>;
};
