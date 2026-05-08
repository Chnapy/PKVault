import { Text } from '@mantine/core';
import { clsx } from 'clsx';
import type React from 'react';
import { Gender } from '../../data/sdk/model';
import classes from './ui-gender.module.css';

export type UIGenderProps = {
    gender: Gender;
    size?: 'small' | 'medium' | 'big';
};

export const UIGender: React.FC<UIGenderProps> = ({ gender, size = 'medium' }) => {
    if (gender === Gender.Genderless) {
        return null;
    }

    return <Text

        className={clsx(
            classes.uiGender,
            gender === Gender.Male && classes.male,
            gender === Gender.Female && classes.female,
            size === 'small' && classes.small,
            size === 'medium' && classes.medium,
            size === 'big' && classes.big,
        )}
    >
        {gender === Gender.Male ? '♂' : '♀'}
    </Text>;
};
