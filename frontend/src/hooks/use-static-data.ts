import type { GameVersion } from '../data/sdk/model';
import { useStaticDataGet } from '../data/sdk/static-data/static-data.gen';

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

    return {
        ...rest,

        itemUnknown: items.items[ 'Mega Pendant' ]!,
        itemPokeball: items.items[ 'Poké Ball' ]!,
        getItem: (version: GameVersion, itemValue: number | string) => {
            const key = typeof itemValue === 'string'
                ? itemValue
                : items.versionItems
                    .find(entry => entry.versions.includes(version))
                    ?.comboItems[ itemValue ];

            if (key === undefined) {
                return;
            }

            return items.items[ key ];
        },
    };
};
