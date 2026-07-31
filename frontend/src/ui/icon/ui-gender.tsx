import { Text } from '@mantine/core';
import { clsx } from 'clsx';
import type React from 'react';
import { Gender } from '../../data/sdk/model';
import classes from './ui-gender.module.css';
import { baseTheme } from '../base-theme';

export type UIGenderProps = {
    gender: Gender;
    size?: 'small' | 'medium' | 'big';
};

export const UIGender: React.FC<UIGenderProps> = ({ gender, size = 'medium' }) => {
    if (gender === Gender.Genderless) {
        return null;
    }

    return <Text
        span
        className={clsx(
            classes.uiGender,
            size === 'small' && classes.small,
            size === 'medium' && classes.medium,
            size === 'big' && classes.big,
        )}
        c={gender === Gender.Male
            ? baseTheme.other.misc.genderMale
            : baseTheme.other.misc.genderFemale}
    >
        {gender === Gender.Male ? '♂' : '♀'}
    </Text>;
};
