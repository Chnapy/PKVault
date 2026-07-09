import { Center, Group, Space, Stack, Text } from '@mantine/core';
import type React from 'react';
import type { Gender } from '../../../data/sdk/model';
import { getSpeciesNO } from '../../../ui/dex-item/util/get-species-no';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIPokerusIcon } from '../../icon/ui-pokerus-icon';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIDetailsLevel } from './ui-details-level';

export type UIDetailsMainProps = {
    species: number;
    speciesName: string;
    gender: Gender;
    isEnabled: boolean;
    isShiny?: boolean;
    isAlpha?: boolean;
    types: React.ReactNode;
    markings: React.ReactNode;
    teraType?: React.ReactNode; // TODO
    ball: React.ReactNode;
    nickname: string;
    level: number;
    // eggHatchCount?: number;
    pokerusDays?: number;
    isPokerusCured?: boolean;
    heldItem?: React.ReactNode;
    children: React.ReactNode;
};

export const UIDetailsMain: React.FC<UIDetailsMainProps> = ({
    ball, nickname, gender, isEnabled, isShiny, isAlpha,
    species, speciesName, level, pokerusDays = 0, isPokerusCured,
    types, heldItem, markings,
    children,
}) => {
    return <Stack gap='xs' w={280} maw='100%'>
        {isEnabled && <>
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
                <Text component='b' size='lg'>#{getSpeciesNO(species)}</Text>
                <Text size='lg' tt='uppercase'>{speciesName}</Text>

                <Space ml='auto' />
                {isAlpha && <UIAlphaIcon size='big' />}
                {isShiny && <UIShinyIcon size='big' />}
            </Group>
        </>}

        <UISpriteSizeWrapper
            speciesSize='lg'
            itemSize='lg'
            component={Group}
            grow align='stretch' gap='xs'>
            <Stack>
                {isEnabled && <>
                    {types}

                    <Space mt='auto' />
                    {heldItem}
                </>}
            </Stack>
            <Center>{children}</Center>
            <Stack align='flex-end'>
                {markings}
                {(pokerusDays || isPokerusCured) && <UIPokerusIcon
                    cured={isPokerusCured}
                    size='big'
                />}
            </Stack>
        </UISpriteSizeWrapper>
    </Stack>;
};
