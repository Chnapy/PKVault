import type React from 'react';
import { BoxType } from '../../data/sdk/model';
import { theme } from '../../ui/theme';
import { css } from '@emotion/css';

export const BoxTypeIcon: React.FC<{
    boxType: BoxType;
}> = ({ boxType }) => {

    const typeLetter = boxType === BoxType.Box
        ? undefined
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        : Object.entries(BoxType).find(([ _, value ]) => value === boxType)?.[ 0 ][ 0 ]?.toUpperCase();

    return typeLetter && <span className={css({
        backgroundColor: theme.bg.default,
        color: theme.text.default,
        borderRadius: 99,
        minWidth: '1lh',
        display: 'inline-block',
        height: '1lh',
        fontSize: '80%',
        textShadow: theme.shadow.text,
    })}>
        {typeLetter}
    </span>;
};
