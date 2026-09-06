import { Box, Progress } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../translate/i18n';

export const UIDetailsLevel: React.FC<{
    level: number;
    showBar?: boolean;
}> = ({ level, showBar }) => {
    const { t } = useTranslate();

    return <Box pos='relative' display='inline-block'>
        <span style={{ fontSize: '80%' }}>{t('details.level')}</span>
        {level}

        {showBar && <Progress
            value={level}
            animated={level === 100}
            h={4}
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
            }}
        />}
    </Box>;
};
