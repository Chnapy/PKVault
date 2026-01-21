import { createSelector } from 'reselect';
import type { PkmVersionDTO } from '../sdk/model';
import { useStorageGetMainPkmVersions } from '../sdk/storage/storage.gen';

type PkmVersionIndexes = {
    byId: Record<PkmVersionDTO['id'], PkmVersionDTO>;
    byBox: Record<PkmVersionDTO['boxId'], Record<PkmVersionDTO['boxSlot'], PkmVersionDTO[]>>;
    byAttachedSave: Record<NonNullable<PkmVersionDTO['attachedSaveId']>, Record<NonNullable<PkmVersionDTO['attachedSavePkmIdBase']>, PkmVersionDTO>>;
    bySpecies: Record<PkmVersionDTO['species'], PkmVersionDTO[]>;
};

const buildIndexes = (data: PkmVersionDTO[]): PkmVersionIndexes => {
    console.time('Build PkmVersion indexes');

    const indexes: PkmVersionIndexes = {
        byId: {},
        byBox: {},
        byAttachedSave: {},
        bySpecies: {},
    };

    data.forEach(version => {
        indexes.byId[version.id] = version;
        indexes.byBox[version.boxId] ??= {};
        indexes.byBox[version.boxId]![version.boxSlot] ??= [];
        indexes.byBox[version.boxId]![version.boxSlot]!.push(version);
        if (version.attachedSaveId && version.attachedSavePkmIdBase) {
            indexes.byAttachedSave[version.attachedSaveId] ??= {};
            indexes.byAttachedSave[version.attachedSaveId]![version.attachedSavePkmIdBase] = version;
        }
        indexes.bySpecies[version.species] ??= [];
        indexes.bySpecies[version.species]!.push(version);
    });

    console.timeEnd('Build PkmVersion indexes');

    return indexes;
};

const cachedIndexes = createSelector((data: PkmVersionDTO[]) => data, buildIndexes);

export const usePkmVersionIndex = () => {
    return useStorageGetMainPkmVersions({
        query: {
            select: query => ({
                ...query,
                data: cachedIndexes(query.data),
            }),
            staleTime: Infinity,
        },
    });
};
