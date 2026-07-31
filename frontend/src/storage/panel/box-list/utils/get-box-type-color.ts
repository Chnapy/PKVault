import type { MantineColor } from '@mantine/core';
import { BoxType } from '../../../../data/sdk/model';

export const getBoxTypeColor = (type: BoxType): MantineColor | undefined => {
    switch (type) {
        case BoxType.Box: return undefined;
        case BoxType.Party: return 'primary.7';
        case BoxType.Daycare: return 'teal';
        default: return 'gray';
    }
};
