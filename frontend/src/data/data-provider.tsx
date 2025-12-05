import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BackendErrorsContext } from './backend-errors-context';
import { responseBackSchema, type ResponseBack } from './mutator/custom-instance';
import { getBackupGetAllQueryKey, type backupGetAllResponse } from './sdk/backup/backup.gen';
import { getDexGetAllQueryKey, type dexGetAllResponse } from './sdk/dex/dex.gen';
import { DataDTOType, type DataDTO } from './sdk/model';
import { getSaveInfosGetAllQueryKey, type saveInfosGetAllResponse } from './sdk/save-infos/save-infos.gen';
import { getSettingsGetQueryKey, type settingsGetResponse } from './sdk/settings/settings.gen';
import { getStaticDataGetQueryKey, type staticDataGetResponse } from './sdk/static-data/static-data.gen';
import { getStorageGetActionsQueryKey, getStorageGetMainBanksQueryKey, getStorageGetMainBoxesQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSaveBoxesQueryKey, getStorageGetSavePkmsQueryKey, type storageGetActionsResponse, type storageGetMainBanksResponse, type storageGetMainBoxesResponse, type storageGetMainPkmsResponse, type storageGetMainPkmVersionsResponse, type storageGetSaveBoxesResponse, type storageGetSavePkmsResponse } from './sdk/storage/storage.gen';
import { getWarningsGetWarningsQueryKey, type warningsGetWarningsResponse } from './sdk/warnings/warnings.gen';

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
          if (error) console.log('error', error);
          if (!isResponse(data)) {
            return;
          }

          const errorMessage = data.headers.get('error-message');
          const errorStack = data.headers.get('error-stack');
          if (errorMessage) {
            backendErrors.addError({
              message: errorMessage && JSON.parse(errorMessage),
              stack: errorStack && JSON.parse(errorStack),
              status: data.status,
            });
          }

          if (!hasDataDTO(data)) {
            // console.log('NOT stockage-dto', data, error);
            return;
          }

          // console.log('stockage-dto', data);

          const { settings, staticData, mainBanks, mainBoxes, mainPkms, mainPkmVersions, saves, dex, actions, warnings, saveInfos, backups } = data.data;

          if (settings) {
            client.setQueryData(
              getSettingsGetQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: settings,
              } satisfies settingsGetResponse
            );
          }

          if (staticData) {
            client.setQueryData(
              getStaticDataGetQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: staticData,
              } satisfies staticDataGetResponse
            );
          }

          if (mainBanks) {
            client.setQueryData(
              getStorageGetMainBanksQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: mainBanks,
              } satisfies storageGetMainBanksResponse
            );
          }

          if (mainBoxes) {
            client.setQueryData(
              getStorageGetMainBoxesQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: mainBoxes,
              } satisfies storageGetMainBoxesResponse
            );
          }

          if (mainPkms) {
            client.setQueryData(
              getStorageGetMainPkmsQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: mainPkms,
              } satisfies storageGetMainPkmsResponse
            );
          }

          if (mainPkmVersions) {
            client.setQueryData(
              getStorageGetMainPkmVersionsQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: mainPkmVersions,
              } satisfies storageGetMainPkmVersionsResponse
            );
          }

          if (saves) {
            saves.forEach(saveData => {
              if (saveData.saveId === 0) {
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

              if (saveData.saveBoxes) {
                client.setQueryData(
                  getStorageGetSaveBoxesQueryKey(saveData.saveId),
                  {
                    status: 200,
                    headers: new Headers(),
                    data: saveData.saveBoxes,
                  } satisfies storageGetSaveBoxesResponse
                );
              }

              if (saveData.savePkms) {
                client.setQueryData(
                  getStorageGetSavePkmsQueryKey(saveData.saveId),
                  {
                    status: 200,
                    headers: new Headers(),
                    data: saveData.savePkms,
                  } satisfies storageGetSavePkmsResponse
                );
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
              } satisfies dexGetAllResponse
            );
          }

          if (actions) {
            client.setQueryData(
              getStorageGetActionsQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: actions,
              } satisfies storageGetActionsResponse
            );
          }

          if (warnings) {
            client.setQueryData(
              getWarningsGetWarningsQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: warnings,
              } satisfies warningsGetWarningsResponse
            );
          }

          if (saveInfos) {
            client.setQueryData(
              getSaveInfosGetAllQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: saveInfos,
              } satisfies saveInfosGetAllResponse
            );
          }

          if (backups) {
            client.setQueryData(
              getBackupGetAllQueryKey(),
              {
                status: 200,
                headers: new Headers(),
                data: backups,
              } satisfies backupGetAllResponse
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
