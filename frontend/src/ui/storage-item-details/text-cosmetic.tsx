import { css } from '@emotion/css';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { Contest } from '../contest/contest';
import { Ribbon } from '../ribbon/ribbon';

export type TextCosmeticProps = {
    contest?: number[];
    ribbons?: Record<string, number>;
};

export const TextCosmetic: React.FC<TextCosmeticProps> = ({
    contest = [],
    ribbons = {},
}) => {
    const { t } = useTranslate();

    const ribbonsList = Object.entries(ribbons);

    return <>
        {contest.length > 0 && <>
            {t('details.contest')}
            <div className={css({
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 4,
            })}>
                {contest.map((value, i) => <Contest
                    key={i}
                    index={i}
                    value={value}
                />)}
            </div>
        </>}

        {ribbonsList.length > 0 && <>
            <br />
            <div className={css({
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 4,
            })}>
                {ribbonsList.map(([ name, count ]) => <Ribbon
                    key={name}
                    name={name}
                    count={count}
                />)}
            </div>
        </>}
    </>;
};
