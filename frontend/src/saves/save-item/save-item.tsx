import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { getDexGetAllQueryKey } from "../../data/sdk/dex/dex.gen";
import {
  getSaveInfosGetAllQueryKey,
  useSaveInfosDelete,
  useSaveInfosGetAll,
} from "../../data/sdk/save-infos/save-infos.gen";
import { useStorageGetActions } from '../../data/sdk/storage/storage.gen';
import { getWarningsGetWarningsQueryKey } from '../../data/sdk/warnings/warnings.gen';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { Container } from "../../ui/container/container";
import { SaveCardContentFull } from '../../ui/save-card/save-card-content-full';

export type SaveItemProps = {
  saveId: number;
  onClick?: () => void;
  showDelete?: boolean;
  // showOldSaves?: boolean;
};

export const SaveItem: React.FC<SaveItemProps> = ({
  saveId,
  onClick,
  showDelete,
  // showOldSaves,
}) => {
  const queryClient = useQueryClient();
  const saveInfosQuery = useSaveInfosGetAll();
  const stockageActionsQuery = useStorageGetActions();
  const saveInfosDeleteMutation = useSaveInfosDelete({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getSaveInfosGetAllQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getDexGetAllQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getWarningsGetWarningsQueryKey(),
        });
      },
    },
  });
  // const saveInfosRestoreBackupMutation = useSaveInfosRestoreBackup({
  //   mutation: {
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries({
  //         queryKey: getSaveInfosGetAllQueryKey(),
  //       });

  //       await queryClient.invalidateQueries({
  //         queryKey: getStorageGetActionsQueryKey(),
  //       });
  //       await queryClient.invalidateQueries({
  //         queryKey: getStorageGetMainPkmsQueryKey(),
  //       });
  //       await queryClient.invalidateQueries({
  //         queryKey: getStorageGetMainPkmVersionsQueryKey(),
  //       });
  //       if (saveId) {
  //         await queryClient.invalidateQueries({
  //           queryKey: getStorageGetSavePkmsQueryKey(saveId),
  //         });
  //       }

  //       await queryClient.invalidateQueries({
  //         queryKey: getWarningsGetWarningsQueryKey(),
  //       });
  //     },
  //   },
  // });

  // const [ showBackups, setShowBackups ] = React.useState(false);

  if (!saveInfosQuery.data) {
    return null;
  }

  const hasStockageActions = stockageActionsQuery.data?.data.length !== 0;

  // const saveInfos = Object.values(saveInfosQuery.data.data);

  // const saves = saveInfos.find((save) => save.id === saveId)!;

  const mainSave = saveInfosQuery.data.data[ saveId ];
  // const backupSaves = saves.filter(save => save.isBackup);

  return (
    <Container
      as={onClick ? "button" : "div"}
      padding="big"
      style={{ display: "flex", flexDirection: "column", gap: 4, width: 350 }}
      onClick={onClick}
    >
      {mainSave && <SaveCardContentFull
        id={mainSave.id}
        generation={mainSave.generation}
        version={mainSave.version}
        trainerName={mainSave.trainerName}
        trainerGenderMale={mainSave.trainerGender === 0}
        tid={mainSave.tid}
        lastWriteTime={mainSave.lastWriteTime}
        playTime={mainSave.playTime}
        dexSeenCount={mainSave.dexSeenCount}
        dexCaughtCount={mainSave.dexCaughtCount}
        ownedCount={mainSave.ownedCount}
        shinyCount={mainSave.shinyCount}
        actions={!hasStockageActions &&
          // backupSaves.length === 0 &&
          mainSave.canDelete &&
          showDelete && <>
            <ButtonWithConfirm onClick={() =>
              saveInfosDeleteMutation.mutateAsync({
                params: {
                  saveId: mainSave.id,
                },
              })}>
              Delete
            </ButtonWithConfirm>
          </>}
      />}

      {/* {showOldSaves && backupSaves.length > 0 && (
        <>
          <Button onClick={() => setShowBackups(!showBackups)}>
            {showBackups ? "Hide" : "Show"} backups (
            {backupSaves.length})
          </Button>

          {showBackups &&
            backupSaves.map((item) => (
              <SaveCardContentFull
                key={item.lastWriteTime}
                id={item.id}
                generation={item.generation}
                version={item.version}
                trainerName={item.trainerName}
                trainerGenderMale={item.trainerGender === 0}
                tid={item.tid}
                lastWriteTime={item.lastWriteTime}
                playTime={item.playTime}
                dexSeenCount={item.dexSeenCount}
                dexCaughtCount={item.dexCaughtCount}
                ownedCount={item.ownedCount}
                shinyCount={item.shinyCount}
                actions={<>
                  <ButtonWithConfirm onClick={() =>
                    saveInfosRestoreBackupMutation.mutateAsync({
                      params: {
                        saveId: item.id,
                        backupTime: item.backupTime!,
                      },
                    })
                  }>
                    Restore
                  </ButtonWithConfirm>

                  <ButtonWithConfirm onClick={() =>
                    saveInfosDeleteMutation.mutateAsync({
                      params: {
                        saveId: item.id,
                        backupTime: item.backupTime,
                      },
                    })}>
                    Delete
                  </ButtonWithConfirm>
                </>}
              />
            ))}
        </>
      )} */}
    </Container>
  );
};
