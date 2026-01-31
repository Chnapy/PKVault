import type React from 'react';
import { Gender as GenderType } from '../../data/sdk/model';
import { theme } from '../theme';
import { css, cx } from '@emotion/css';

export type GenderProps = {
    gender: GenderType;
    className?: string;
};

export const Gender: React.FC<GenderProps> = ({ gender, className }) => {
    if (gender === GenderType.Genderless) {
        return null;
    }

    return <span className={cx(css({
        fontFamily: theme.font.special,
        color: gender === GenderType.Male ? '#00C6AD' : '#FF4273',
    }), className)}>{gender === GenderType.Male ? '♂' : '♀'}</span>;
};
