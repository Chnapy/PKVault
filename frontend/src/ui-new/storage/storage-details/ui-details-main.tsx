import { Center, Group, Space, Stack, Text } from '@mantine/core';
import type React from 'react';
import type { Gender } from '../../../data/sdk/model';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIDetailsLevel } from './ui-details-level';

export type UIDetailsMainProps = {
    species: number;
    speciesName: string;
    gender: Gender;
    isShiny?: boolean;
    isAlpha?: boolean;
    types: React.ReactNode;
    markings: React.ReactNode;
    teraType?: number;
    ball: React.ReactNode;
    nickname: string;
    level: number;
    eggHatchCount?: number;
    pokerusDays?: number;
    isPokerusCured?: boolean;
    heldItem?: React.ReactNode;
    children: React.ReactNode;
};

export const UIDetailsMain: React.FC<UIDetailsMainProps> = ({
    ball, nickname, gender, isShiny, isAlpha,
    species, speciesName, level,
    types, heldItem, markings,
    children,
}) => {
    return <Stack gap='xs'>
        <Group>
            {ball}
            <Text size='xl'>{nickname}</Text>
            <UIGender gender={gender} size='big' />

            <Space ml='auto' />
            <Text size='lg'>
                <UIDetailsLevel level={level} />
            </Text>
        </Group>

        <Group>
            <Text component='b' size='lg'>#{species}</Text>
            <Text size='lg' tt='uppercase'>{speciesName}</Text>

            <Space ml='auto' />
            {isAlpha && <UIAlphaIcon size='big' />}
            {isShiny && <UIShinyIcon size='big' />}
        </Group>

        <UISpriteSizeWrapper
            speciesSize='lg'
            itemSize='lg'
            component={Group}
            grow align='stretch' gap='xs'>
            <Stack>
                {types}

                <Space mt='auto' />
                {heldItem}
            </Stack>
            <Center>{children}</Center>
            <Stack>
                {markings}
            </Stack>
        </UISpriteSizeWrapper>
    </Stack>;
};
