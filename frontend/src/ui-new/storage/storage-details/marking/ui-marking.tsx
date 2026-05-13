import { clsx } from 'clsx';
import type React from 'react';
import { MarkingColorUniversal } from '../../../../data/sdk/model';
import { theme } from '../../../../ui/theme';
import classes from './ui-marking.module.css';

type UIMarkingProps = {
    index: number;
    mark: MarkingColorUniversal;
};

export const UIMarking: React.FC<UIMarkingProps> = ({ index, mark }) => {
    return <span
        className={clsx(
            classes.uiMarking,
            mark === MarkingColorUniversal.NotMarked && classes.notMarked,
            index === 0 && classes.circle,
            index === 1 && classes.triangle,
            // index === 2 && classes.square,
            index === 3 && classes.heart,
            index === 4 && classes.star,
            index === 5 && classes.diamond,
        )}
        style={{
            backgroundColor: mark === MarkingColorUniversal.MarkedBlue ? theme.misc.markBlue
                : mark === MarkingColorUniversal.MarkedPink ? theme.misc.markPink
                    : undefined,
        }}
    />;
};
