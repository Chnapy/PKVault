import { Badge, Group, Image, Tooltip } from '@mantine/core';
import { FootprintsIcon, GlobeIcon, HeartIcon } from 'lucide-react';
import React, { type JSX } from 'react';
import { GameVersion, RelativePhysicalStats, StyleMove, TimeOfDay, Trigger, type EntityContext, type TriggerData } from '../../../../data/sdk/model';
import { useStaticData } from '../../../../hooks/use-static-data';
import { ItemImg } from '../../../../img/item-img';
import { SpeciesImg } from '../../../../img/species-img';
import { useTranslate } from '../../../../translate/i18n';
import { UIGender } from '../../../../ui/icon/ui-gender';
import { UIPokedexIcons } from '../../../../ui/pokedex/icons/ui-pokedex-icons';
import { UISpriteSizeWrapper } from '../../../../ui/sprite-img/ui-sprite-size-wrapper';
import { getTypeImg } from '../../../../ui/type-item/util/get-type-img';
import { switchUtil } from '../../../../util/switch-util';

type DexEvolutionTriggerLineProps = TriggerData & {
    context: EntityContext;
};

export const DexEvolutionTriggerLine: React.FC<DexEvolutionTriggerLineProps> = ({
    context,
    trigger,
    level,
    item,
    friendship,
    gender,
    move,
    moveType,
    styleMove,
    minItemCount,
    minMoveCount,
    minDamageTaken,
    minBeauty,
    minSteps,
    partySpecies,
    partyType,
    region,
    relativePhysicalStats,
    tradeSpecies,
    shed,
    nearSpecialRock,
    needsMultiplayer,
    needsOverworldRain,
    turnUpsideDown,
    threeDefeatedBisharp,
    gimmighoulCoins,
    timeOfDay,
    evolutionIsPossible,
}) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const getSpeciesName = (key?: number) => key !== undefined ? staticData.species[ key ]?.forms[ context ]?.[ 0 ]?.name : undefined;

    const getItemName = (key?: string) => key !== undefined ? staticData.getItem(GameVersion.Any, key)?.name : undefined;

    const getMoveName = (key?: number) => key !== undefined ? staticData.moves[ key ]?.name : undefined;

    // const getTypeName = (key?: number) => key !== undefined ? staticData.types[ key ]?.name : undefined;

    const renderItem = (key: string) => <Group wrap='nowrap' gap='xs'>
        <ItemImg item={key} version={GameVersion.Any} style={{ verticalAlign: 'middle' }} />
        {getItemName(key)}
    </Group>;

    const renderSpecies = (species: number) => <Group wrap='nowrap' gap='xs'>
        <SpeciesImg context={context} species={species} form={0} style={{ marginInline: -6 }} />
        {getSpeciesName(species)}
    </Group>;

    const renderType = (type?: number) => type !== undefined && <Image src={getTypeImg(type).img} h='0.8lh' w='auto' bdrs='md' />;

    const renderMove = (move: number) => {
        const data = staticData.moves[ move ]?.dataUntilGeneration;
        const type = data?.[ data.length - 1 ]?.type;

        return <Group wrap='nowrap' gap='xs'>
            {renderType(type)}
            {getMoveName(move)}
        </Group>;
    };

    const moveAction = trigger === Trigger.UseMove ? t('details.evo.use-move-prefix') : t('details.evo.with-move-prefix');

    return <UISpriteSizeWrapper
        speciesSize={0.4}
        itemSize={0.7}
        component={Group}
        w='100%'
        gap='sm'
    >
        {renderBadge(switchUtil(trigger, {
            [ Trigger.LevelUp ]: level
                ? t('details.evo.level', { level })
                : t('details.evo.level-up'),
            [ Trigger.Trade ]: t('details.evo.trade'),
            [ Trigger.UseItem ]: null,
            [ Trigger.UseMove ]: null,
            [ Trigger.Spin ]: t('details.evo.spin'),
            [ Trigger.TowerDarkness ]: t('details.evo.tower-darkness'),
            [ Trigger.TowerWaters ]: t('details.evo.tower-waters'),
            [ Trigger.ThreeCrits ]: t('details.evo.three-crits'),
            [ Trigger.TakeDamages ]: t('details.evo.take-damages', { damages: minDamageTaken }),
            [ Trigger.RecoilDamages ]: t('details.evo.recoil-damages', { damages: minDamageTaken }),
        }))}

        {tradeSpecies !== undefined && renderBadge(renderSpecies(tradeSpecies))}

        {needsMultiplayer && renderBadge(<>
            <GlobeIcon /> {t('details.evo.multiplayer')}
        </>)}

        {item !== undefined && renderBadge(<>
            {minItemCount} {renderItem(item)}
        </>)}

        {gender !== undefined && renderBadge(<UIGender gender={gender} />)}

        {nearSpecialRock && renderBadge(t('details.evo.near-special-rock'))}

        {friendship !== undefined && renderBadge(<>
            <HeartIcon />
            {t('details.friendship')} {friendship}+
        </>)}

        {minBeauty !== undefined && renderBadge(<>
            <ItemImg item='pokeblock-kit' version={GameVersion.Any} />
            {t('details.contest.beauty')} {minBeauty}+
        </>)}

        {minSteps !== undefined && renderBadge(<>
            <FootprintsIcon />
            {t('details.evo.steps', { steps: minSteps })}
        </>)}

        {threeDefeatedBisharp && renderBadge(<>
            {t('details.evo.three-bisharp.1')} {renderSpecies(625)} {t('details.evo.three-bisharp.2')} {renderItem('leaders-crest')}
        </>)}

        {gimmighoulCoins && renderBadge(<>
            999 {renderItem('gimmighoul-coin')}
        </>)}

        {region !== undefined && renderBadge(t('details.evo.region', { region }))}

        {partySpecies !== undefined && renderBadge(<>
            {renderSpecies(partySpecies)} {t('details.evo.in-party')}
        </>)}

        {partyType !== undefined && renderBadge(<>
            {renderType(partyType)} {t('details.evo.in-party')}
        </>)}

        {renderBadge(<>
            {move !== undefined && <>{moveAction} {renderMove(move)}</>}

            {minMoveCount !== undefined && t('details.evo.move-times', { count: minMoveCount })}

            {styleMove !== undefined && switchUtil(styleMove, {
                [ StyleMove.Strong ]: t('details.evo.strong-style'),
                [ StyleMove.Agile ]: t('details.evo.agile-style'),
            })}
        </>)}

        {moveType !== undefined && renderBadge(<>
            {t('details.evo.with-move')} {renderType(moveType)}
        </>)}

        {shed && renderBadge(<>
            {renderItem(staticData.itemPokeball.id)} {t('details.evo.shed')}
        </>)}

        {relativePhysicalStats !== undefined && renderBadge(<>
            {staticData.stats[ 2 ]?.name} {switchUtil(relativePhysicalStats, {
                [ RelativePhysicalStats.AttackLessDefense ]: '<',
                [ RelativePhysicalStats.AttackEqualDefense ]: '=',
                [ RelativePhysicalStats.AttackMoreDefense ]: '>',
            })} {staticData.stats[ 3 ]?.name}
        </>)}

        {needsOverworldRain && renderBadge(t('details.evo.rain'))}

        {turnUpsideDown && renderBadge(t('details.evo.upside-down'))}

        {timeOfDay !== undefined && renderBadge(<>
            {switchUtil(timeOfDay, {
                [ TimeOfDay.Day ]: t('details.evo.time.day'),
                [ TimeOfDay.Night ]: t('details.evo.time.night'),
                [ TimeOfDay.Dusk ]: t('details.evo.time.dusk'),
                [ TimeOfDay.FullMoon ]: t('details.evo.time.full-moon'),
            })}
        </>)}

        {evolutionIsPossible && <Tooltip label={t('details.evo.possible')}>
            <UIPokedexIcons.Evolve ml='auto' />
        </Tooltip>}

    </UISpriteSizeWrapper>;
};

const renderBadge = (children: React.ReactNode) => {
    if (!hasAnyChild(children))
        return null;

    return <Badge variant='default' fz='xs' tt='none' px='sm' py={0}>
        <Group wrap='nowrap' gap='sm'>
            {children}
        </Group>
    </Badge>;
};

const hasAnyChild = (children: React.ReactNode): boolean => React.Children.toArray(children).some(c => {
    if (!c)
        return false;

    if (typeof c === 'object' && (c as JSX.Element).type.toString() === 'Symbol(react.fragment)')
        return hasAnyChild((c as JSX.Element).props.children ?? []);

    return true;
});

