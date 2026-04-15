import { css } from '@emotion/css';
import type React from 'react';
import { LanguageID } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { theme } from '../theme';

export type TextMiscProps = {
    languageID: LanguageID;
    homeTracker?: number;
};

export const TextMisc: React.FC<TextMiscProps> = ({
    languageID,
    homeTracker,
}) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    return <>
        {t('details.language')}{' '}
        <span className={css({ color: theme.text.primary })}>{staticData.languages[ languageID ] || '---'}</span>
        {typeof homeTracker === 'number' && <>
            <br />
            {t('details.home-tracker')}{' '}
            {homeTracker}
        </>}
    </>;
};
