import { Badge, Center, Group, Space, Stack, Text, ThemeIcon } from '@mantine/core';
import { EyeIcon, FolderIcon } from 'lucide-react';
import type React from 'react';
import type { Gender } from '../../../data/sdk/model';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';

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
    const wrapIcon = (icon: React.ReactNode) => <ThemeIcon variant='default'>
        {icon}
    </ThemeIcon>;

    return <Stack gap='xs'>
        <Group>
            <Text component='b' size='lg'>#{species}</Text>
            <Text size='lg' tt='uppercase'>{speciesName}</Text>
            {form && <Badge variant='default'>{form}</Badge>}
            <UIGender gender={gender} size='big' />

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

                {/* <Space mt='auto' />
                {heldItem} */}
            </Stack>
            <Center>{children}</Center>
            <Stack align='flex-end' gap='sm'>
                {isSeen && wrapIcon(<EyeIcon />)}
                {isCaught && wrapIcon(<UIBallIcon />)}
                {isOwned && wrapIcon(<FolderIcon />)}
            </Stack>
        </UISpriteSizeWrapper>
    </Stack>;
};
