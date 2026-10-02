import type { GameVersion } from '../data/sdk/model';
import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';

export type StaticData = ReturnType<typeof useStaticData>;

/**
 * Returns static-data as defined,
 * since static-data must be loaded once on app start.
 */
export const useStaticData = () => {
    const { data } = useStaticDataGet();

    if (!data) {
        throw new Error('Static data not loaded');
    }

    const { items, ...rest } = data.data;

    const getItemKey = (version: GameVersion, itemValue: number) => items.versionItems
        .find(entry => entry.versions.includes(version))
        ?.comboItems[ itemValue ];

    const getItem = (version: GameVersion, itemValue: number | string) => {
        const key = typeof itemValue === 'string'
            ? itemValue
            : getItemKey(version, itemValue);

        if (key === undefined) {
            return;
        }

        return items.items[ key ];
    };

    const isItemCompatible = (version: GameVersion, itemKey: string) => Object.values(items.versionItems
        .find(entry => entry.versions.includes(version))
        ?.comboItems ?? {}).includes(itemKey);

    return {
        ...rest,

        itemUnknown: items.items[ 'mega-pendant' ]!,
        itemPokeball: items.items[ 'poke-ball' ]!,
        getItemKey,
        getItem,
        isItemCompatible,
    };
};
