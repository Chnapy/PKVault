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
import { useTranslate } from '../../../translate/i18n';

export type UIDetailsMainProps = {
    saveId?: number;
    species: number;
    speciesName: string;
    gender: Gender;
    isEnabled: boolean;
    isShiny?: boolean;
    isAlpha?: boolean;
    isN?: boolean;
    types: React.ReactNode;
    markings: React.ReactNode;
    teraType?: React.ReactNode;
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
    ball, nickname, gender, isEnabled, isShiny, isAlpha, isN,
    species, speciesName, level, pokerusDays = 0, isPokerusCured,
    canEvolve, isDuplicate, warning,
    types, teraType, heldItem, markings, attachedBtn,
    children,
}) => {
    const { t } = useTranslate();

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

            <Group wrap='nowrap'>
                <Text component='b' size='lg'>#{getSpeciesNO(species)}</Text>
                <Text
                    size='lg'
                    tt='uppercase'
                    style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >{speciesName}</Text>

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
                    controlLabel={t('details.dex.go')}
                    size='compact-xs'
                    mr='auto'
                >
                    {t('details.dex')}
                </UIButton>

                {isAlpha && <UIAlphaIcon size='big' />}
                {isShiny && <UIShinyIcon size='big' />}
                {isN && <Tooltip label={t('details.n.description')}>
                    <UIPokedexIcons.N />
                </Tooltip>}
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

                    {teraType && <Stack gap='xs'>
                        <Text c='dimmed' size='sm'>{t('details.teratype')}</Text>
                        {teraType}
                    </Stack>}

                    <Space mt='auto' />
                    {heldItem}
                </>}
            </Stack>
            <Center>{children}</Center>
            <Stack align='flex-end'>
                {markings}

                {(pokerusDays || isPokerusCured) && <Tooltip label={isPokerusCured
                    ? t('details.pokerus.cured')
                    : t('details.pokerus.infected', { days: pokerusDays })}
                >
                    <UIPokerusIcon
                        cured={isPokerusCured}
                        size='big'
                    />
                </Tooltip>}

                <Group justify='flex-end' gap='xs'>
                    {canEvolve && <Tooltip label={t('storage.actions.evolve.description')}>
                        <UIPokedexIcons.Evolve size='sm' />
                    </Tooltip>}
                    {isDuplicate && <Tooltip label={t('details.duplicate.description')}>
                        <UIPokedexIcons.Duplicate size='sm' />
                    </Tooltip>}
                    {warning && <Tooltip label={t('details.issues.description')}>
                        <UIPokedexIcons.Warn size='sm' />
                    </Tooltip>}
                </Group>

                {attachedBtn}
            </Stack>
        </UISpriteSizeWrapper>
    </Stack>;
};
