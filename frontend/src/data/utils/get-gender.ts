import { switchUtil } from '../../util/switch-util';

export type GenderType = 'male' | 'female' | null;

export const getGender = (gender: number) => switchUtil<number, Record<number, GenderType>>(gender, {
    0: 'male',
    1: 'female',
    2: null,
});
