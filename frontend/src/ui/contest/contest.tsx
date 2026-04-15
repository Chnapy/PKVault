import { css, cx } from '@emotion/css';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { theme } from '../theme';

type ContestProps = {
    index: number;
    value: number;
};

export const Contest: React.FC<ContestProps> = ({ index, value }) => {
    const { t } = useTranslate();

    const getContestInfo = (index: number) => {
        switch (index) {
            case 0: return {
                className: css({ backgroundColor: theme.contest.cool }),
                label: t('details.contest.cool'),
            };
            case 1: return {
                className: css({ backgroundColor: theme.contest.beauty }),
                label: t('details.contest.beauty'),
            };
            case 2: return {
                className: css({ backgroundColor: theme.contest.cute }),
                label: t('details.contest.cute'),
            };
            case 3: return {
                className: css({ backgroundColor: theme.contest.smart }),
                label: t('details.contest.smart'),
            };
            case 4: return {
                className: css({ backgroundColor: theme.contest.tough }),
                label: t('details.contest.tough'),
            };
            case 5: return {
                className: css({ backgroundColor: theme.bg.dark }),
                label: t('details.contest.sheen'),
            };
            default: return {};
        }
    };

    const { className, label } = getContestInfo(index);

    return <div className={css({
        position: 'relative',
        height: 17,
        marginTop: 1,
        marginBottom: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        paddingRight: 2,
        opacity: value === 0 ? 0.5 : undefined,
    })}>
        <div
            className={cx(css({
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                opacity: 0.2,
            }, className))}
        />

        <div
            className={cx(css({
                width: 4,
                alignSelf: 'stretch',
            }), className)}
        />

        <span>{label}</span>

        <span className={css({
            minWidth: 21,
            textAlign: 'right',
        })}>{value}</span>
    </div>;
};
