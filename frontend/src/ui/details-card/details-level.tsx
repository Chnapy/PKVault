import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { css } from '@emotion/css';

export const DetailsLevel: React.FC<{ level: number }> = ({ level }) => {
    const { t } = useTranslate();

    return <span>
        <span className={css({ fontSize: '80%' })}>{t('details.level')}</span>
        {level}
    </span>;
};
