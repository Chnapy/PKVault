import { Card, EmptyState, Loader, Stack, Table, Text, Title } from '@mantine/core';
import type React from 'react';
import { useDexGetAll, useDexGetLocations } from '../../../data/sdk/dex/dex.gen';
import { AbilityPermission, type EntityContext, type GameVersion } from '../../../data/sdk/model';
import { useStaticData } from '../../../hooks/use-static-data';
import { SpeciesImg } from '../../../img/species-img';
import { useTranslate } from '../../../translate/i18n';
import { UISpriteSizeWrapper } from '../../../ui/sprite-img/ui-sprite-size-wrapper';
import { UICardSectionControl } from '../../../ui/storage/storage-panel/card-section-control/ui-card-section-control';
import { switchUtil } from '../../../util/switch-util';
import { PackageOpenIcon } from 'lucide-react';

type PokedexDetailsLocationsProps = {
    saveId: number;
    context: EntityContext;
    version: GameVersion;
    species: number;
};

export const PokedexDetailsLocations: React.FC<PokedexDetailsLocationsProps> = ({ saveId, context, version, species }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const dex = useDexGetAll();

    const dexLocations = useDexGetLocations({ version, species });

    const isPending = [ dex, dexLocations ].some(q => q.isPending);

    if (isPending)
        return <Loader />;

    const dexData = dex.data?.data[ species ]?.[ saveId ]?.forms ?? [];

    const cards = Object.entries(dexLocations.data?.data.locations ?? {}).map(([ locationName, locationsByMethod ]) => {

        return <Card key={locationName}>
            <Card.Section component={UICardSectionControl} withBorder inheritPadding py='sm'>
                <Title order={5} ta='center'>
                    {locationName}
                </Title>
            </Card.Section>

            <Card.Section withBorder inheritPadding py='md'>
                <UISpriteSizeWrapper
                    speciesSize='sm'
                    component={'div'}
                >
                    {Object.entries(locationsByMethod).map(([ encounterMethodName, locations ]) => {

                        return <Table key={encounterMethodName} verticalSpacing='xs' horizontalSpacing='xs'>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th colSpan={2} ta='center'>{encounterMethodName}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {locations.map((l, i) => {

                                    type Abilities = [ number?, number?, number?];

                                    const abilities = l.forms.reduce<Abilities>((acc, form) => {
                                        const formItem = dexData[ form ];
                                        if (!formItem)
                                            return acc;

                                        const abilities: Abilities = [ ...acc ];

                                        formItem.abilities.forEach((a, i) => {
                                            if (a === formItem.abilityHidden)
                                                abilities[ 2 ] = a;
                                            else
                                                abilities[ i ] = a;
                                        });

                                        return abilities;
                                    }, []);

                                    const getFormName = (index: 0 | 1 | 2) => {
                                        const ability = abilities[ index ];
                                        if (ability === undefined)
                                            return;

                                        const name = staticData.abilities[ ability ]?.name;
                                        if (index === 2) {
                                            return `${name} (${t('details.ability.hidden')})`;
                                        }
                                        return name;
                                    };

                                    return <Table.Tr key={i}>
                                        <Table.Td>
                                            {l.forms.map(form =>
                                                <SpeciesImg key={form} context={context} species={species} form={form} isEgg={l.isEgg} isShiny={l.isShiny} />
                                            )}
                                        </Table.Td>
                                        <Table.Td ta='right' miw={98}>
                                            <Text size='sm'>
                                                {t('details.level')} {[ ...l.levels ]
                                                    .sort((l1, l2) => {
                                                        return (l1.levelMin + l1.levelMax) / 2 - (l2.levelMin + l2.levelMax) / 2;
                                                    })
                                                    .map(({ levelMin, levelMax }) =>
                                                        `${levelMin}${levelMax === levelMin ? '' : '-' + levelMax}`
                                                    ).join(' ')}
                                            </Text>
                                            {l.abilitiesAllowed !== AbilityPermission.Any12 && <Text size='sm' lh={1} c='dimmed'>
                                                {t('details.ability')}: {switchUtil(l.abilitiesAllowed, {
                                                    [ AbilityPermission.Any12H ]: [ getFormName(0), getFormName(1), getFormName(2) ],
                                                    [ AbilityPermission.OnlyFirst ]: [ getFormName(0) ],
                                                    [ AbilityPermission.OnlySecond ]: [ getFormName(1) ],
                                                    [ AbilityPermission.OnlyHidden ]: [ getFormName(2) ],
                                                }).filter(Boolean).join(' / ')}
                                            </Text>}
                                        </Table.Td>
                                    </Table.Tr>;
                                })}
                            </Table.Tbody>
                        </Table>;
                    })}
                </UISpriteSizeWrapper>
            </Card.Section>
        </Card>;
    });

    return <Stack>
        {cards.length === 0 && <EmptyState
            size='xs'
            icon={<PackageOpenIcon />}
        />}

        {cards}
    </Stack>;
};
