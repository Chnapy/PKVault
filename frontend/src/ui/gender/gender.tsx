import type React from 'react';
import { theme } from '../theme';
import type { GenderType } from '../../data/utils/get-gender';

export type GenderProps = {
    gender: GenderType;
};

export const Gender: React.FC<GenderProps> = ({ gender }) => {
    if (!gender) {
        return null;
    }

    return <span style={{
        fontFamily: theme.font.special,
        color: gender === 'male' ? '#00C6AD' : '#FF4273'
    }}>{gender === 'male' ? '♂' : '♀'}</span>;
};
