import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import type { DexItemForm, EntityContext, Gender } from '../../../data/sdk/model';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from '../../../routes/pokedex';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { usePokedexFilters } from './use-pokedex-filters';

type PokedexItems = Counts & {
    isLoading: boolean;
    speciesItemsByGenerationList: SpeciesItemsByGeneration[];
};

type SpeciesItemsByGeneration = Counts & {
    generation: number;
    speciesInfos: SpeciesInfos[];
};

type Counts = {
    seenCount: number;
    caughtCount: number;
    ownedCount: number;
    shinyCount: number;
    totalCount: number;
    itemsCount: number;
};

type SpeciesInfos = {
    species: number;
    itemsToRender: SpeciesFormItem[];
    isSeen: boolean;
};

export type SpeciesFormItem = {
    id: string;
    context: EntityContext;
    species: number;
    form: number;
    genders: Gender[];
    isSeen: boolean;
    isSeenShiny: boolean;
    isCaught: boolean;
    isOwned: boolean;
    isOwnedShiny: boolean;
};

/**
 * Prepare all pokedex items by grouping them following filters on form/genders if any.
 * Gives most data required by PokedexList.
 */
export const usePokedexItems = (): PokedexItems => {
    const staticData = useStaticData();

    const showForms = Route.useSearch({ select: (search) => search.showForms ?? false });
    const showGendersRaw = Route.useSearch({ select: (search) => search.showGenders ?? false });

    const { data, isLoading } = useDexGetAll();

    const { isPkmFiltered, filterSpeciesValues } = usePokedexFilters();

    const speciesRecord = data?.data ?? {};

    const keys = Object.keys(speciesRecord)
        .map(Number)
        .sort((a, b) => a - b);

    const lastSpecies = keys[ keys.length - 1 ];

    const speciesList = new Array(lastSpecies).fill(0).map((_, i) => i + 1);

    const filteredSpeciesList = speciesList
        .map((species) =>
            Object.values(speciesRecord[ species + "" ] ?? {}).filter(
                filterSpeciesValues,
            ),
        )
        .filter((speciesValues) => !isPkmFiltered(speciesValues));

    const speciesItemsByGeneration = filteredSpeciesList.reduce<{
        [ generation in number ]?: SpeciesItemsByGeneration;
    }>((acc, dexItems) => {
        const species = dexItems[ 0 ]!.species;
        const generation = staticData.species[ species ]?.generation ?? -1;

        const staticForms = staticData.species[ species ]?.forms ?? {};

        const allForms = dexItems.flatMap(value => value.forms);

        const differentForms = [ ...new Set(allForms.map(form => form.form)) ];

        const hasGenderDifferencesByForm = differentForms.reduce<Record<number, boolean>>((acc, formValue) => {
            const hasGenderDifferences = allForms
                .some(form => form.form === formValue
                    && staticForms[ form.context ]?.[ form.form ]?.hasGenderDifferences);

            return {
                ...acc,
                [ formValue ]: hasGenderDifferences
            };
        }, {});

        const groupBy = <K extends keyof Pick<DexItemForm, 'form' | 'gender'>>(groupKeysRaw: K[]) => {
            return allForms.reduce<{
                [ key in string ]?: SpeciesFormItem
            }>((acc, form) => {

                const groupKeys = hasGenderDifferencesByForm[ form.form ]
                    ? groupKeysRaw
                    : groupKeysRaw.filter(key => key !== 'gender');

                const key = groupKeys.map(groupKey => form[ groupKey ]).join('.');

                const oldGroup = acc[ key ];

                const group: SpeciesFormItem = {
                    ...oldGroup,
                    id: key,
                    context: Math.max(oldGroup?.context ?? -1, form.context) as EntityContext,
                    species,
                    form: Math.min(oldGroup?.form ?? 99, form.form),
                    genders: [ ...new Set([ form.gender, ...oldGroup?.genders ?? [] ]) ].sort(),
                    isSeen: oldGroup?.isSeen || form.isSeen,
                    isSeenShiny: oldGroup?.isSeenShiny || form.isSeenShiny,
                    isCaught: oldGroup?.isCaught || form.isCaught,
                    isOwned: oldGroup?.isOwned || form.isOwned,
                    isOwnedShiny: oldGroup?.isOwnedShiny || form.isOwnedShiny,
                };

                return {
                    ...acc,
                    [ key ]: group,
                };
            }, {});
        };

        const hasGenderDifferences = Object.values(hasGenderDifferencesByForm).some(v => v);

        const showGenders = showGendersRaw && hasGenderDifferences;

        const getItemsToRender = (): SpeciesFormItem[] => {
            if (!showForms && !showGenders) {
                const groupFlat = groupBy([])[ '' ]!;

                return [ groupFlat ];
            }

            if (!showForms && showGenders) {
                const groupsByGender = groupBy([ 'gender' ]);

                return Object.values(groupsByGender).filter(filterIsDefined);
            }

            if (showForms && !showGenders) {
                const groupsByForm = groupBy([ 'form' ]);

                return Object.values(groupsByForm).filter(filterIsDefined);
            }

            const groupsByFormGender = groupBy([ 'form', 'gender' ]);

            return Object.values(groupsByFormGender).filter(filterIsDefined);
        };

        const itemsToRender = getItemsToRender()
            // sort by species
            // then by form
            // then by gender
            .sort((g1, g2) => {
                if (g1.species !== g2.species)
                    return (g1.species < g2.species) ? -1 : 1;

                if (g1.form !== g2.form)
                    return (g1.form < g2.form) ? -1 : 1;

                if (g1.genders.length === 1 && g2.genders.length === 1
                    && g1.genders[ 0 ] !== g2.genders[ 0 ]
                )
                    return (g1.genders[ 0 ]! < g2.genders[ 0 ]!) ? -1 : 1;

                return 0;
            });

        const isSeen = itemsToRender.some(item => item.isSeen);
        const isCaught = itemsToRender.some(item => item.isCaught);
        const isOwned = itemsToRender.some(item => item.isOwned);
        const isOwnedShiny = itemsToRender.some(item => item.isOwnedShiny);

        const seenCount = acc[ generation ]?.seenCount ?? 0;
        const caughtCount = acc[ generation ]?.caughtCount ?? 0;
        const ownedCount = acc[ generation ]?.ownedCount ?? 0;
        const shinyCount = acc[ generation ]?.shinyCount ?? 0;
        const totalCount = acc[ generation ]?.totalCount ?? 0;
        const itemsCount = acc[ generation ]?.itemsCount ?? 0;

        const itemForGeneration: SpeciesItemsByGeneration = {
            ...acc[ generation ],
            generation,
            speciesInfos: [
                ...acc[ generation ]?.speciesInfos ?? [],
                {
                    species,
                    itemsToRender,
                    isSeen,
                },
            ],
            seenCount: seenCount + (isSeen ? 1 : 0),
            caughtCount: caughtCount + (isCaught ? 1 : 0),
            ownedCount: ownedCount + (isOwned ? 1 : 0),
            shinyCount: shinyCount + (isOwnedShiny ? 1 : 0),
            totalCount: totalCount + 1,
            itemsCount: itemsCount + itemsToRender.length,
        };

        return {
            ...acc,
            [ generation ]: itemForGeneration,
        } satisfies typeof acc;
    }, {});

    const speciesItemsByGenerationList = Object.values(speciesItemsByGeneration).filter(filterIsDefined);

    const seenCount = speciesItemsByGenerationList.reduce((acc, item) => acc + item.seenCount, 0);
    const caughtCount = speciesItemsByGenerationList.reduce((acc, item) => acc + item.caughtCount, 0);
    const ownedCount = speciesItemsByGenerationList.reduce((acc, item) => acc + item.ownedCount, 0);
    const shinyCount = speciesItemsByGenerationList.reduce((acc, item) => acc + item.shinyCount, 0);
    const totalCount = speciesItemsByGenerationList.reduce((acc, item) => acc + item.totalCount, 0);
    const itemsCount = speciesItemsByGenerationList.reduce((acc, item) => acc + item.itemsCount, 0);

    return {
        isLoading,
        speciesItemsByGenerationList,
        seenCount,
        caughtCount,
        ownedCount,
        shinyCount,
        totalCount,
        itemsCount,
    };
};
