import { Group } from '@mantine/core';
import type React from 'react';
import type { MarkingColorUniversal } from '../../../../data/sdk/model';
import { UIMarking } from './ui-marking';
import classes from './ui-marking.module.css';

export type UIMarkingListProps = {
    markings: MarkingColorUniversal[];
};

export const UIMarkingList: React.FC<UIMarkingListProps> = ({ markings }) => {
    return <Group className={classes.uiMarkingList}>
        {markings.map((mark, i) => <UIMarking
            key={i}
            index={i}
            mark={mark}
        />)}
    </Group>;
};
