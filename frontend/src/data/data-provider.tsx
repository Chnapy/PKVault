import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { filterIsDefined } from '../util/filter-is-defined';
import { BackendErrorsContext } from './backend-errors-context';
import { getPkmLegalityQueryKey, type PkmLegalityQueryData } from './hooks/use-pkm-legality';
import { QueryError, responseBackSchema, type ResponseBack } from './mutator/custom-instance';
import { getBackupGetAllQueryKey, type backupGetAllResponseSuccess } from './sdk/backup/backup.gen';
import { getDexGetAllQueryKey, type dexGetAllResponseSuccess } from './sdk/dex/dex.gen';
import { DataDTOType, type DataDTO, type DataDTOStateOfDictionaryOfStringAndPkmLegalityDTOData } from './sdk/model';
import { getSaveInfosGetAllQueryKey, type saveInfosGetAllResponseSuccess } from './sdk/save-infos/save-infos.gen';
import { getSettingsGetQueryKey, type settingsGetResponseSuccess } from './sdk/settings/settings.gen';
import { getStaticDataGetQueryKey, type staticDataGetResponseSuccess } from './sdk/static-data/static-data.gen';
import { getStorageGetActionsQueryKey, getStorageGetMainBanksQueryKey, getStorageGetMainBoxesQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSaveBoxesQueryKey, getStorageGetSavePkmsQueryKey, type storageGetActionsResponseSuccess, type storageGetMainPkmsResponseSuccess, type storageGetSaveBoxesResponseSuccess, type storageGetSavePkmsResponseSuccess } from './sdk/storage/storage.gen';
import { getWarningsGetWarningsQueryKey, type warningsGetWarningsResponseSuccess } from './sdk/warnings/warnings.gen';

const isResponse = (obj: unknown): obj is ResponseBack => responseBackSchema.safeParse(obj).success;

const hasDataDTO = (obj: ResponseBack): obj is ResponseBack<DataDTO> =>
  typeof obj.data === 'object' && obj.data !== null && 'type' in obj.data && obj.data.type === DataDTOType.DATA_DTO;

export const DataProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const backendErrors = BackendErrorsContext.useValue();
  const [ client ] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false,
      },
      mutations: {
        onSettled: async (data, error) => {
          if (error instanceof QueryError) {
            backendErrors.addError({
              message: error.errorMessage ?? undefined,
              stack: error.errorStack ?? undefined,
              status: error.status,
            });
          }

          if (!isResponse(data) || !hasDataDTO(data)) {
            return;
          }

          type QueryDataBase = {
            status: number;
            headers: Headers;
            data: unknown;
          };
          type DataDTOState = {
            all: boolean;
            data?: Record<string, unknown>;
          };
          const applyResponseData = function (responseData: DataDTOState, queryKey: readonly unknown[]) {
            const getData = () => {
              if (responseData.all) {
                return Object.values(responseData.data ?? {}).filter(filterIsDefined);
              }

              const oldResponse: Partial<storageGetMainPkmsResponseSuccess> = client.getQueryData(queryKey) ?? {};
              const oldData = Object.fromEntries((oldResponse.data ?? [])
                .map(item => [ item.id, item ]));

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

          const applyPkmLegalities = (saveId: number, pkmLegalitiesMap: DataDTOStateOfDictionaryOfStringAndPkmLegalityDTOData) => {
            Object.entries(pkmLegalitiesMap).forEach(([ pkmId, pkmLegality ]) => {
              const queryKey = getPkmLegalityQueryKey(pkmId, saveId);
              if (pkmLegality) {
                client.setQueryData(
                  queryKey,
                  {
                    status: 200,
                    headers: new Headers(),
                    data: pkmLegality,
                  } satisfies PkmLegalityQueryData
                );
              } else {
                client.removeQueries({ queryKey });
              }
            });
          };

          // console.log('stockage-dto', data);

          const { settings, staticData, mainBanks, mainBoxes, mainPkms, mainPkmVersions, mainPkmLegalities, saves, invalidateAllSaves, dex, actions, warnings, saveInfos, backups } = data.data;

          if (settings) {
            client.setQueryData(
              getSettingsGetQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: settings,
              } satisfies settingsGetResponseSuccess
            );
          }

          if (staticData) {
            client.setQueryData(
              getStaticDataGetQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: staticData,
              } satisfies staticDataGetResponseSuccess
            );
          }

          if (mainBanks) {
            applyResponseData(mainBanks, getStorageGetMainBanksQueryKey());
          }

          if (mainBoxes) {
            applyResponseData(mainBoxes, getStorageGetMainBoxesQueryKey());
          }

          if (mainPkms) {
            applyResponseData(mainPkms, getStorageGetMainPkmsQueryKey());
          }

          if (mainPkmVersions) {
            applyResponseData(mainPkmVersions, getStorageGetMainPkmVersionsQueryKey());
          }

          if (mainPkmLegalities) {
            applyPkmLegalities(0, mainPkmLegalities.data ?? {});
          }

          if (invalidateAllSaves) {
            const [ saveBoxStart, saveBoxEnd ] = getStorageGetSaveBoxesQueryKey(-999)[ 0 ].split('-999');
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
                  : (isSavePkmQuery
                    ? queryKeyValue.slice(savePkmStart!.length, -savePkmEnd!.length)
                    : 0)
                );

                return saveId !== 0;
              },
            });

            for (const query of saveQueries) {
              client.invalidateQueries({ queryKey: query.queryKey })
            }
          }

          if (saves) {
            saves.forEach(saveData => {

              if (saveData.saveBoxes) {
                client.setQueryData(
                  getStorageGetSaveBoxesQueryKey(saveData.saveId),
                  {
                    status: 200,
                    headers: new Headers(),
                    data: saveData.saveBoxes,
                  } satisfies storageGetSaveBoxesResponseSuccess
                );
              }

              if (saveData.savePkms) {
                const getData = (): storageGetSavePkmsResponseSuccess[ 'data' ] => {
                  if (saveData.savePkms?.all) {
                    return Object.values(saveData.savePkms.data ?? {}).filter(filterIsDefined);
                  }

                  const oldSavePkmsResponse: Partial<storageGetSavePkmsResponseSuccess> = client.getQueryData(
                    getStorageGetSavePkmsQueryKey(saveData.saveId)
                  ) ?? {};
                  const oldSavePkms = Object.fromEntries((oldSavePkmsResponse.data ?? [])
                    .map(savePkm => [ savePkm.id, savePkm ]));

                  return Object.values({
                    ...oldSavePkms,
                    ...saveData.savePkms!.data,
                  }).filter(filterIsDefined);
                };

                client.setQueryData(
                  getStorageGetSavePkmsQueryKey(saveData.saveId),
                  {
                    status: 200,
                    headers: new Headers(),
                    data: getData(),
                  } satisfies storageGetSavePkmsResponseSuccess
                );
              }

              if (saveData.savePkmLegality) {
                applyPkmLegalities(saveData.saveId, saveData.savePkmLegality.data ?? {});
              }
            });
          }

          if (dex) {
            client.setQueryData(
              getDexGetAllQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: dex,
              } satisfies dexGetAllResponseSuccess
            );
          }

          if (actions) {
            client.setQueryData(
              getStorageGetActionsQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: actions,
              } satisfies storageGetActionsResponseSuccess
            );
          }

          if (warnings) {
            client.setQueryData(
              getWarningsGetWarningsQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: warnings,
              } satisfies warningsGetWarningsResponseSuccess
            );
          }

          if (saveInfos) {
            client.setQueryData(
              getSaveInfosGetAllQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: saveInfos,
              } satisfies saveInfosGetAllResponseSuccess
            );
          }

          if (backups) {
            client.setQueryData(
              getBackupGetAllQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: backups,
              } satisfies backupGetAllResponseSuccess
            );
          }
        }
      }
    }
  }));

  return <QueryClientProvider client={client}>
    {children}
  </QueryClientProvider>;
};
