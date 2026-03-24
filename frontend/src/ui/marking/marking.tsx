import { css, cx } from '@emotion/css';
import type React from 'react';
import { MarkingColorUniversal } from '../../data/sdk/model';
import { theme } from '../theme';

type MarkingProps = {
    index: number;
    mark: MarkingColorUniversal;
};

export const Marking: React.FC<MarkingProps> = ({ index, mark }) => {

    return <span
        className={cx(
            css({
                aspectRatio: 1,
                width: 12,
                height: 12,
                backgroundColor: theme.bg.darker,
            }),
            {
                [ css({
                    opacity: 0.25
                }) ]: mark === MarkingColorUniversal.NotMarked,
                [ css({
                    backgroundColor: theme.misc.markBlue,
                }) ]: mark === MarkingColorUniversal.MarkedBlue,
                [ css({
                    backgroundColor: theme.misc.markPink,
                }) ]: mark === MarkingColorUniversal.MarkedPink,

                [ css({
                    borderRadius: 99,
                }) ]: index === 0,
                [ css({
                    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%, 0% 100%)',
                }) ]: index === 1,
                // square by default
                // [ css({
                // }) ]: i === 2,
                [ css({
                    clipPath: 'shape(from 50% 91%, line to 90% 50%, arc to 50% 9%  of 1%, arc to 10% 50% of 1%)',
                }) ]: index === 3,
                [ css({
                    clipPath: 'polygon(50% 0%, 66% 32%, 100% 38%, 78% 64%, 83% 100%, 50% 83%, 17% 100%, 22% 64%, 0 38%, 34% 32%)',
                }) ]: index === 4,
                [ css({
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }) ]: index === 5,
            }
        )}
    />;
};
