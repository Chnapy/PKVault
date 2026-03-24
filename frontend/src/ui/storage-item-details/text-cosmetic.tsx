import { css } from '@emotion/css';
import type React from 'react';
import { MarkingColorUniversal } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { Contest } from '../contest/contest';
import { Marking } from '../marking/marking';
import { Ribbon } from '../ribbon/ribbon';

export type TextCosmeticProps = {
    markings?: MarkingColorUniversal[];
    contest?: number[];
    ribbons?: Record<string, number>;
};

export const TextCosmetic: React.FC<TextCosmeticProps> = ({
    markings = [],
    contest = [],
    ribbons = {},
}) => {
    const { t } = useTranslate();

    const ribbonsList = Object.entries(ribbons);

    return <>
        {markings.length > 0 && <div className={css({
            height: '1lh',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
        })}>
            {markings.map((mark, i) => <Marking
                key={i}
                index={i}
                mark={mark}
            />)}
        </div>}

        {contest.length > 0 && <>
            <br />
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
