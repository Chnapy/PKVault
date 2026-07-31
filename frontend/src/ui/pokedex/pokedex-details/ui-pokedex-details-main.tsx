import { Badge, Center, Group, Space, Stack, Text } from '@mantine/core';
import type React from 'react';
import type { Gender } from '../../../data/sdk/model';
import { getSpeciesNO } from '../../../pokedex/list/dex-item/util/get-species-no';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIPokedexIcons } from '../icons/ui-pokedex-icons';

export type UIPokedexDetailsMainProps = {
    species: number;
    speciesName: string;
    form?: string;
    gender: Gender;
    isSeen?: boolean;
    isCaught?: boolean;
    isOwned?: boolean;
    isShiny?: boolean;
    isAlpha?: boolean;
    types: React.ReactNode;
    children: React.ReactNode;
};

export const UIPokedexDetailsMain: React.FC<UIPokedexDetailsMainProps> = ({
    species, speciesName, form, gender,
    isSeen, isCaught, isOwned, isShiny, isAlpha,
    types, children,
}) => {
    return <Stack gap='xs' w={280} maw='100%'>
        <Group wrap='nowrap'>
            <Text component='b' size='lg'>#{getSpeciesNO(species)}</Text>
            <Text size='lg' tt='uppercase'>{speciesName}</Text>
            {form && <Badge variant='default'>{form}</Badge>}
            <UIGender gender={gender} size='big' />

            <Space ml='auto' />
            {isAlpha && <UIPokedexIcons.Alpha>
                <UIAlphaIcon size='big' />
            </UIPokedexIcons.Alpha>}
            {isShiny && <UIPokedexIcons.Shiny>
                <UIShinyIcon size='big' />
            </UIPokedexIcons.Shiny>}
        </Group>

        <UISpriteSizeWrapper
            speciesSize='lg'
            itemSize='lg'
            component={Group}
            grow align='stretch' gap='xs'>
            <Stack>
                {types}

                {/* <Space mt='auto' />
                {heldItem} */}
            </Stack>
            <Center>{children}</Center>
            <Stack align='flex-end' gap='xs'>
                {isSeen && <UIPokedexIcons.Seen />}
                {isCaught && <UIPokedexIcons.Caught />}
                {isOwned && <UIPokedexIcons.Owned />}
            </Stack>
        </UISpriteSizeWrapper>
    </Stack>;
};
