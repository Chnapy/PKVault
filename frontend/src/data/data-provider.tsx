import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { getBackupGetAllQueryKey, type backupGetAllResponse } from './sdk/backup/backup.gen';
import { DataDTOType, type DataDTO } from './sdk/model';
import { getSaveInfosGetAllQueryKey, type saveInfosGetAllResponse } from './sdk/save-infos/save-infos.gen';
import { getSettingsGetQueryKey, type settingsGetResponse } from './sdk/settings/settings.gen';
import { getStorageGetActionsQueryKey, getStorageGetMainBoxesQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSaveBoxesQueryKey, getStorageGetSavePkmsQueryKey, type storageGetActionsResponse, type storageGetMainBoxesResponse, type storageGetMainPkmsResponse, type storageGetMainPkmVersionsResponse, type storageGetSaveBoxesResponse, type storageGetSavePkmsResponse } from './sdk/storage/storage.gen';
import { getWarningsGetWarningsQueryKey, type warningsGetWarningsResponse } from './sdk/warnings/warnings.gen';

const hasStockageDTO = (obj: unknown): obj is { data: DataDTO; headers: Headers; status: 200; } =>
  typeof obj === 'object' && obj !== null && 'data' in obj
  && typeof obj.data === 'object' && obj.data !== null && 'type' in obj.data
  && obj.data.type === DataDTOType.DATA_DTO;

export const DataProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [ client ] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
      },
      mutations: {
        onSuccess: async (data) => {
          if (!hasStockageDTO(data)) {
            // console.log('NOT stockage-dto', data);
            return;
          }

          // console.log('stockage-dto', data);

          const { settings, mainBoxes, mainPkms, mainPkmVersions, saves, actions, warnings, saveInfos, backups } = data.data;

          if (settings) {
            client.setQueryData(
              getSettingsGetQueryKey(),
              {
                ...data,
                data: settings,
              } satisfies settingsGetResponse
            );
          }

          if (mainBoxes) {
            client.setQueryData(
              getStorageGetMainBoxesQueryKey(),
              {
                ...data,
                data: mainBoxes,
              } satisfies storageGetMainBoxesResponse
            );
          }

          if (mainPkms) {
            client.setQueryData(
              getStorageGetMainPkmsQueryKey(),
              {
                ...data,
                data: mainPkms,
              } satisfies storageGetMainPkmsResponse
            );
          }

          if (mainPkmVersions) {
            client.setQueryData(
              getStorageGetMainPkmVersionsQueryKey(),
              {
                ...data,
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

                    const isSaveBoxQuery = queryKeyValue.startsWith(saveBoxStart) && queryKeyValue.endsWith(saveBoxEnd);
                    const isSavePkmQuery = queryKeyValue.startsWith(savePkmStart) && queryKeyValue.endsWith(savePkmEnd);

                    return isSaveBoxQuery || isSavePkmQuery;
                  },
                });

                saveQueries.forEach(query => {
                  client.invalidateQueries(query);
                });
                return;
              }

              if (saveData.saveBoxes) {
                client.setQueryData(
                  getStorageGetSaveBoxesQueryKey(saveData.saveId),
                  {
                    ...data,
                    data: saveData.saveBoxes,
                  } satisfies storageGetSaveBoxesResponse
                );
              }

              if (saveData.savePkms) {
                client.setQueryData(
                  getStorageGetSavePkmsQueryKey(saveData.saveId),
                  {
                    ...data,
                    data: saveData.savePkms,
                  } satisfies storageGetSavePkmsResponse
                );
              }
            });
          }

          if (actions) {
            client.setQueryData(
              getStorageGetActionsQueryKey(),
              {
                ...data,
                data: actions,
              } satisfies storageGetActionsResponse
            );
          }

          if (warnings) {
            client.setQueryData(
              getWarningsGetWarningsQueryKey(),
              {
                ...data,
                data: warnings,
              } satisfies warningsGetWarningsResponse
            );
          }

          if (saveInfos) {
            client.setQueryData(
              getSaveInfosGetAllQueryKey(),
              {
                ...data,
                data: saveInfos,
              } satisfies saveInfosGetAllResponse
            );
          }

          if (backups) {
            client.setQueryData(
              getBackupGetAllQueryKey(),
              {
                ...data,
                data: backups,
              } satisfies backupGetAllResponse
            );
          }
        }
      }
    }
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
