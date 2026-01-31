import type { QueryClient } from '@tanstack/react-query';
import { filterIsDefined } from '../../util/filter-is-defined';
import { responseBackSchema, type ResponseBack } from '../mutator/custom-instance';
import { getBackupGetAllQueryKey, type backupGetAllResponseSuccess } from '../sdk/backup/backup.gen';
import { getDexGetAllQueryKey, type dexGetAllResponseSuccess } from '../sdk/dex/dex.gen';
import { DataDTOType, type DataDTO, type DataDTOStateOfDictionaryOfStringAndPkmLegalityDTOData } from '../sdk/model';
import { getSaveInfosGetAllQueryKey, type saveInfosGetAllResponseSuccess } from '../sdk/save-infos/save-infos.gen';
import { getSettingsGetQueryKey, type settingsGetResponseSuccess } from '../sdk/settings/settings.gen';
import { getStaticDataGetQueryKey, type staticDataGetResponseSuccess } from '../sdk/static-data/static-data.gen';
import {
    getStorageGetActionsQueryKey,
    getStorageGetBoxesQueryKey,
    getStorageGetMainBanksQueryKey,
    getStorageGetSavePkmsQueryKey,
    type storageGetActionsResponseSuccess,
    type storageGetBoxesResponseSuccess,
} from '../sdk/storage/storage.gen';
import { getWarningsGetWarningsQueryKey, type warningsGetWarningsResponseSuccess } from '../sdk/warnings/warnings.gen';
import { getPkmLegalityQueryKey, type PkmLegalityQueryData } from '../hooks/use-pkm-legality';
import { updatePkmSaveCache } from '../hooks/use-pkm-save-index';
import { updatePkmVersionCache } from '../hooks/use-pkm-version-index';

type QueryDataBase = {
    status: number;
    headers: Headers;
    data: unknown;
};

type DataDTOState = {
    all: boolean;
    data?: Record<string, unknown>;
};

/**
 * Extract data from mutation response,
 * then update react-query cache with formatted data,
 * avoiding any need of refetch.
 */
export const updateCacheMutationResponse = (client: QueryClient, data: unknown) => {
    if (!isResponse(data) || !hasDataDTO(data)) {
        return;
    }

    const {
        settings,
        staticData,
        mainBanks,
        mainBoxes,
        mainPkmVersions,
        dex,
        mainPkmLegalities,
        saves,
        invalidateAllSaves,
        actions,
        warnings,
        saveInfos,
        backups,
    } = data.data;

    if (settings) {
        client.setQueryData(getSettingsGetQueryKey(), {
            status: 200,
            headers: new Headers(),
            data: settings,
        } satisfies settingsGetResponseSuccess);
    }

    if (staticData) {
        client.setQueryData(getStaticDataGetQueryKey(), {
            status: 200,
            headers: new Headers(),
            data: staticData,
        } satisfies staticDataGetResponseSuccess);
    }

    if (mainBanks) {
        applyResponseData(client, mainBanks, getStorageGetMainBanksQueryKey());
    }

    if (mainBoxes) {
        applyResponseData(client, mainBoxes, getStorageGetBoxesQueryKey());
    }

    if (mainPkmVersions) {
        updatePkmVersionCache(client, mainPkmVersions);
    }

    if (dex) {
        applyDex(client, dex);
    }

    if (mainPkmLegalities) {
        applyPkmLegalities(client, 0, mainPkmLegalities.data ?? {});
    }

    if (invalidateAllSaves) {
        const [ saveBoxStart, saveBoxEnd ] = getStorageGetBoxesQueryKey({ saveId: -999 })[ 0 ].split('-999');
        const [ savePkmStart, savePkmEnd ] = getStorageGetSavePkmsQueryKey(-999)[ 0 ].split('-999');

        const saveQueries = client.getQueryCache().findAll({
            predicate: query => {
                if (!Array.isArray(query.queryKey) || typeof query.queryKey[ 0 ] !== 'string') {
                    return false;
                }

                const queryKeyValue = query.queryKey[ 0 ];

                const isSaveBoxQuery = queryKeyValue.startsWith(saveBoxStart!) && queryKeyValue.endsWith(saveBoxEnd!);
                const isSavePkmQuery = queryKeyValue.startsWith(savePkmStart!) && queryKeyValue.endsWith(savePkmEnd!);

                const saveId = +(isSaveBoxQuery
                    ? queryKeyValue.slice(saveBoxStart!.length, -saveBoxEnd!.length)
                    : isSavePkmQuery
                        ? queryKeyValue.slice(savePkmStart!.length, -savePkmEnd!.length)
                        : 0);

                return saveId !== 0;
            },
        });

        for (const query of saveQueries) {
            client.invalidateQueries({ queryKey: query.queryKey });
        }
    } else if (saves) {
        saves.forEach(saveData => {
            if (saveData.saveBoxes) {
                client.setQueryData(getStorageGetBoxesQueryKey({ saveId: saveData.saveId }), {
                    status: 200,
                    headers: new Headers(),
                    data: saveData.saveBoxes,
                } satisfies storageGetBoxesResponseSuccess);
            }

            if (saveData.savePkms) {
                updatePkmSaveCache(client, saveData.saveId, saveData.savePkms);
            }

            if (saveData.savePkmLegality) {
                applyPkmLegalities(client, saveData.saveId, saveData.savePkmLegality.data ?? {});
            }
        });
    }

    if (actions) {
        client.setQueryData(getStorageGetActionsQueryKey(), {
            status: 200,
            headers: new Headers(),
            data: actions,
        } satisfies storageGetActionsResponseSuccess);
    }

    if (warnings) {
        client.setQueryData(getWarningsGetWarningsQueryKey(), {
            status: 200,
            headers: new Headers(),
            data: warnings,
        } satisfies warningsGetWarningsResponseSuccess);
    }

    if (saveInfos) {
        client.setQueryData(getSaveInfosGetAllQueryKey(), {
            status: 200,
            headers: new Headers(),
            data: saveInfos,
        } satisfies saveInfosGetAllResponseSuccess);
    }

    if (backups) {
        client.setQueryData(getBackupGetAllQueryKey(), {
            status: 200,
            headers: new Headers(),
            data: backups,
        } satisfies backupGetAllResponseSuccess);
    }
};

const isResponse = (obj: unknown): obj is ResponseBack => responseBackSchema.safeParse(obj).success;

const hasDataDTO = (obj: ResponseBack): obj is ResponseBack<DataDTO> =>
    typeof obj.data === 'object' && obj.data !== null && 'type' in obj.data && obj.data.type === DataDTOType.DATA_DTO;

const applyResponseData = function (client: QueryClient, responseData: DataDTOState, queryKey: readonly unknown[]) {
    const getData = () => {
        if (responseData.all) {
            return Object.values(responseData.data ?? {}).filter(filterIsDefined);
        }

        const oldResponse: Partial<{ data?: { id: string }[] }> = client.getQueryData(queryKey) ?? {};
        const oldData = Object.fromEntries((oldResponse.data ?? []).map(item => [ item.id, item ]));

        return Object.values({
            ...oldData,
            ...responseData.data,
        }).filter(filterIsDefined);
    };

    client.setQueryData(queryKey, {
        status: 200,
        headers: new Headers(),
        data: getData(),
    } satisfies QueryDataBase);
};

const applyDex = function (client: QueryClient, responseData: DataDTOState) {
    const queryKey = getDexGetAllQueryKey();

    const getData = () => {
        if (responseData.all) {
            return responseData.data ?? {};
        }

        const oldResponse: Partial<dexGetAllResponseSuccess> = client.getQueryData(queryKey) ?? {};
        const oldData = oldResponse.data ?? {};

        return Object.values({
            ...oldData,
            ...responseData.data,
        }).filter(filterIsDefined);
    };

    client.setQueryData(queryKey, {
        status: 200,
        headers: new Headers(),
        data: getData(),
    } satisfies QueryDataBase);
};

const applyPkmLegalities = (client: QueryClient, saveId: number, pkmLegalitiesMap: DataDTOStateOfDictionaryOfStringAndPkmLegalityDTOData) => {
    Object.entries(pkmLegalitiesMap).forEach(([ pkmId, pkmLegality ]) => {
        const queryKey = getPkmLegalityQueryKey(pkmId, saveId);
        if (pkmLegality) {
            client.setQueryData(queryKey, {
                status: 200,
                headers: new Headers(),
                data: pkmLegality,
            } satisfies PkmLegalityQueryData);
        } else {
            client.removeQueries({ queryKey });
        }
    });
};
