import type React from 'react';
import { useTranslate } from '../../translate/i18n';

export const DetailsLevel: React.FC<{ level: number }> = ({ level }) => {
    const { t } = useTranslate();

    return <span>
        <span style={{ fontSize: '80%' }}>{t('details.level')}</span>
        {level}
    </span>;
};
