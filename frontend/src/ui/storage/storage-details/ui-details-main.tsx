import { Center, Group, Space, Stack, Text, Tooltip } from '@mantine/core';
import type React from 'react';
import { type Gender } from '../../../data/sdk/model';
import { Route as PokedexRoute } from '../../../routes/pokedex';
import { Route as StorageRoute } from '../../../routes/storage';
import { getSpeciesNO } from '../../../pokedex/list/dex-item/util/get-species-no';
import { UIButton } from '../../form/button/ui-button';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIPokerusIcon } from '../../icon/ui-pokerus-icon';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UIPokedexIcons } from '../../pokedex/icons/ui-pokedex-icons';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIDetailsLevel } from './ui-details-level';

export type UIDetailsMainProps = {
    saveId?: number;
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
    canEvolve?: boolean;
    isDuplicate?: boolean;
    warning?: boolean;
    heldItem?: React.ReactNode;
    attachedBtn?: React.ReactNode;
    children: React.ReactNode;
};

export const UIDetailsMain: React.FC<UIDetailsMainProps> = ({
    saveId,
    ball, nickname, gender, isEnabled, isShiny, isAlpha,
    species, speciesName, level, pokerusDays = 0, isPokerusCured,
    canEvolve, isDuplicate, warning,
    types, heldItem, markings, attachedBtn,
    children,
}) => {
    return <Stack gap='xs' w={280} maw='100%'>
        {isEnabled && <>
            <Group>
                {ball}
                <Text size='xl'>{nickname}</Text>
                <UIGender gender={gender} size='big' />

                <Space ml='auto' />
                <Text component='div' size='lg'>
                    <UIDetailsLevel level={level} showBar />
                </Text>
            </Group>

            <Group>
                <Text component='b' size='lg'>#{getSpeciesNO(species)}</Text>
                <Text size='lg' tt='uppercase'>{speciesName}</Text>

                <UIButton
                    component={StorageRoute.Link}
                    to={PokedexRoute.to}
                    search={(oldSearch: Record<string, unknown>) => {
                        // remove all search params
                        const clearedSearch = Object.fromEntries(Object.keys(oldSearch).map(key => [ key, undefined ]));

                        return {
                            ...clearedSearch,
                            selected: species,
                            selectedSaveId: saveId ?? 0,
                        } satisfies typeof PokedexRoute[ 'types' ][ 'searchSchemaInput' ];
                    }}
                    name='pokedex-link'
                    controlLabel='Go to Pokedex'
                    size='compact-xs'
                    mr='auto'
                >
                    Pokedex
                </UIButton>

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

                {(pokerusDays || isPokerusCured) && <Tooltip label={isPokerusCured
                    ? 'Pokerus cured'
                    : `Pokerus infected (${pokerusDays} days)`}
                >
                    <UIPokerusIcon
                        cured={isPokerusCured}
                        size='big'
                    />
                </Tooltip>}

                <Group justify='flex-end' gap='xs'>
                    {canEvolve && <Tooltip label='Evolve is possible'>
                        <UIPokedexIcons.Evolve size='sm' />
                    </Tooltip>}
                    {isDuplicate && <Tooltip label='Duplicates are present in save'>
                        <UIPokedexIcons.Duplicate size='sm' />
                    </Tooltip>}
                    {warning && <Tooltip label='Issues are present'>
                        <UIPokedexIcons.Warn size='sm' />
                    </Tooltip>}
                </Group>

                {attachedBtn}
            </Stack>
        </UISpriteSizeWrapper>
    </Stack>;
};
