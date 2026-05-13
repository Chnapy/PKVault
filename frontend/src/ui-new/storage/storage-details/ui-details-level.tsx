import type React from 'react';
import { useTranslate } from '../../../translate/i18n';

export const UIDetailsLevel: React.FC<{ level: number }> = ({ level }) => {
    const { t } = useTranslate();

    return <span>
        {t('details.level')}
        {level}
    </span>;
};
