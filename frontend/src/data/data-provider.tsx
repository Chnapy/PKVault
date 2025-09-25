import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BackendErrorsContext } from './backend-errors-context';
import { responseBackSchema, type ResponseBack } from './mutator/custom-instance';
import { getBackupGetAllQueryKey, type backupGetAllResponse } from './sdk/backup/backup.gen';
import { DataDTOType, type DataDTO } from './sdk/model';
import { getSaveInfosGetAllQueryKey, type saveInfosGetAllResponse } from './sdk/save-infos/save-infos.gen';
import { getSettingsGetQueryKey, type settingsGetResponse } from './sdk/settings/settings.gen';
import { getStorageGetActionsQueryKey, getStorageGetMainBoxesQueryKey, getStorageGetMainPkmsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSaveBoxesQueryKey, getStorageGetSavePkmsQueryKey, type storageGetActionsResponse, type storageGetMainBoxesResponse, type storageGetMainPkmsResponse, type storageGetMainPkmVersionsResponse, type storageGetSaveBoxesResponse, type storageGetSavePkmsResponse } from './sdk/storage/storage.gen';
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
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        onSettled: async (data) => {
          if (!isResponse(data)) {
            return;
          }

          const errorMessage = data.headers.get('error-message');
          const errorStack = data.headers.get('error-stack');
          if (errorMessage) {
            backendErrors.addError({
              message: errorMessage,
              stack: errorStack!,
              status: data.status,
            });
          }

          if (!hasDataDTO(data)) {
            // console.log('NOT stockage-dto', data, error);
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
              } satisfies Omit<settingsGetResponse, 'status'>
            );
          }

          if (mainBoxes) {
            client.setQueryData(
              getStorageGetMainBoxesQueryKey(),
              {
                ...data,
                data: mainBoxes,
              } satisfies Omit<storageGetMainBoxesResponse, 'status'>
            );
          }

          if (mainPkms) {
            client.setQueryData(
              getStorageGetMainPkmsQueryKey(),
              {
                ...data,
                data: mainPkms,
              } satisfies Omit<storageGetMainPkmsResponse, 'status'>
            );
          }

          if (mainPkmVersions) {
            client.setQueryData(
              getStorageGetMainPkmVersionsQueryKey(),
              {
                ...data,
                data: mainPkmVersions,
              } satisfies Omit<storageGetMainPkmVersionsResponse, 'status'>
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
                  } satisfies Omit<storageGetSaveBoxesResponse, 'status'>
                );
              }

              if (saveData.savePkms) {
                client.setQueryData(
                  getStorageGetSavePkmsQueryKey(saveData.saveId),
                  {
                    ...data,
                    data: saveData.savePkms,
                  } satisfies Omit<storageGetSavePkmsResponse, 'status'>
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
              } satisfies Omit<storageGetActionsResponse, 'status'>
            );
          }

          if (warnings) {
            client.setQueryData(
              getWarningsGetWarningsQueryKey(),
              {
                ...data,
                data: warnings,
              } satisfies Omit<warningsGetWarningsResponse, 'status'>
            );
          }

          if (saveInfos) {
            client.setQueryData(
              getSaveInfosGetAllQueryKey(),
              {
                ...data,
                data: saveInfos,
              } satisfies Omit<saveInfosGetAllResponse, 'status'>
            );
          }

          if (backups) {
            client.setQueryData(
              getBackupGetAllQueryKey(),
              {
                ...data,
                data: backups,
              } satisfies Omit<backupGetAllResponse, 'status'>
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
