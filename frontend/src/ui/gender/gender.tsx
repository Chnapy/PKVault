import type React from 'react';
import { Gender as GenderType } from '../../data/sdk/model';
import { theme } from '../theme';

export type GenderProps = {
    gender: GenderType;
    style?: React.CSSProperties;
};

export const Gender: React.FC<GenderProps> = ({ gender, style }) => {
    if (gender === GenderType.Genderless) {
        return null;
    }

    return <span style={{
        fontFamily: theme.font.special,
        color: gender === GenderType.Male ? '#00C6AD' : '#FF4273',
        ...style,
    }}>{gender === GenderType.Male ? '♂' : '♀'}</span>;
};
