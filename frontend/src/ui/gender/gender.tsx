import type React from 'react';
import { GenderType } from '../../data/sdk/model';
import { theme } from '../theme';

export type GenderProps = {
    gender: GenderType;
};

export const Gender: React.FC<GenderProps> = ({ gender }) => {
    return <span style={{
        fontFamily: theme.font.special,
        color: gender === GenderType.MALE ? '#00C6AD' : '#FF4273'
    }}>{gender === GenderType.MALE ? '♂' : '♀'}</span>;
};
