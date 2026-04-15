import { css } from '@emotion/css';
import type React from 'react';
import type { Gender as GenderType } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { Gender } from '../gender/gender';
import { theme } from '../theme';

type DOLineProps = {
    tid: number;
    sid?: number;
    originTrainerName: string;
    originTrainerGender: GenderType;
};

export const DOLine: React.FC<DOLineProps> = ({
    tid,
    sid,
    originTrainerName,
    originTrainerGender,
}) => {
    const { t } = useTranslate();

    return <>
        {t('save.ot')} <span className={css({ color: theme.text.primary })}>{originTrainerName}</span> <Gender gender={originTrainerGender} />
        {' '}- {t('details.tid')} <span className={css({ color: theme.text.primary })}>{tid}</span>
        {typeof sid === 'number' && <> - {t('details.sid')} <span className={css({ color: theme.text.primary })}>{sid}</span></>}
    </>;
};
