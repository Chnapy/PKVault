import React from "react";
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import {
  getSaveInfosDownloadUrl,
  useSaveInfosDelete,
  useSaveInfosGetAll
} from "../../data/sdk/save-infos/save-infos.gen";
import { useStorageGetActions } from '../../data/sdk/storage/storage.gen';
import { Button } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { Container } from "../../ui/container/container";
import { Icon } from '../../ui/icon/icon';
import { SaveCardContentFull } from '../../ui/save-card/save-card-content-full';
import { theme } from '../../ui/theme';

export type SaveItemProps = {
  saveId: number;
  onClick?: () => void;
  onClose?: () => void;
  showDelete?: boolean;
  // showOldSaves?: boolean;
};

export const SaveItem: React.FC<SaveItemProps> = ({
  saveId,
  onClick,
  onClose,
  showDelete,
  // showOldSaves,
}) => {
  const saveInfosQuery = useSaveInfosGetAll();
  const stockageActionsQuery = useStorageGetActions();
  const saveInfosDeleteMutation = useSaveInfosDelete();

  const downloadUrl = getApiFullUrl(getSaveInfosDownloadUrl(saveId));

  // const saveInfosRestoreBackupMutation = useSaveInfosRestoreBackup();

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
      style={{
        backgroundColor: onClick
          ? theme.bg.light
          : theme.bg.panel,
        borderColor: onClick
          ? theme.text.default
          : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: 350
      }}
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
        actions={showDelete && !hasStockageActions &&
          <>
            <Button<'a'> as='a' href={downloadUrl}>
              <Icon name='download' forButton />
            </Button>

            {mainSave.canDelete && <>
              <ButtonWithConfirm onClick={() =>
                saveInfosDeleteMutation.mutateAsync({
                  params: {
                    saveId: mainSave.id,
                  },
                })} bgColor={theme.bg.red}>
                <Icon name='trash' solid forButton />
              </ButtonWithConfirm>
            </>}
          </>}
        onClose={onClose}
      />}
    </Container>
  );
};
