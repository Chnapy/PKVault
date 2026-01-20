import type React from "react";
import { usePkmSaveVersion } from "../../data/hooks/use-pkm-save-version";
import {
  useStorageEvolvePkms,
  useStorageGetSavePkms,
  useStorageMainPkmDetachSave,
  useStorageSaveDeletePkms,
} from "../../data/sdk/storage/storage.gen";
import { Route } from "../../routes/storage";
import { StorageMoveContext } from "../../storage/actions/storage-move-context";
import { getSaveOrder } from "../../storage/util/get-save-order";
import { useTranslate } from "../../translate/i18n";
import { Button } from "../button/button";
import { ButtonWithConfirm } from "../button/button-with-confirm";
import { ButtonWithDisabledPopover } from "../button/button-with-disabled-popover";
import { Icon } from "../icon/icon";
import { StorageDetailsForm } from "../storage-item-details/storage-details-form";
import { theme } from "../theme";
import { StorageItemSaveActionsContainer } from "./storage-item-save-actions-container";

export const StorageItemSaveActions: React.FC<{ saveId: number }> = ({
  saveId,
}) => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const selected = Route.useSearch({ select: (search) => search.selected });

  const formEditMode = StorageDetailsForm.useEditMode();

  const moveClickable = StorageMoveContext.useClickable(
    selected?.id ? [selected.id] : [],
    saveId,
  );

  const pkmSavePkmQuery = useStorageGetSavePkms(saveId ?? 0);

  const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
  const evolvePkmsMutation = useStorageEvolvePkms();
  const savePkmsDeleteMutation = useStorageSaveDeletePkms();

  const getPkmSaveVersion = usePkmSaveVersion();

  const selectedPkm = pkmSavePkmQuery.data?.data.find(
    (pkm) => pkm.id === selected?.id,
  );
  if (!selectedPkm) {
    return null;
  }

  const attachedPkmVersion = getPkmSaveVersion(
    selectedPkm.idBase,
    selectedPkm.saveId,
  );

  const canEvolve = selectedPkm.canEvolve;
  const canDetach = !!attachedPkmVersion;
  const canGoToMain = !!attachedPkmVersion;
  const canRemovePkm = selectedPkm.canDelete;

  return (
    <StorageItemSaveActionsContainer saveId={saveId} pkmId={selectedPkm.id}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxWidth: 170,
        }}
      >
        {moveClickable.onClick && (
          <Button onClick={moveClickable.onClick}>
            <Icon name="logout" solid forButton />
            {t("storage.actions.move")}
          </Button>
        )}

        {moveClickable.onClickAttached && (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={moveClickable.onClickAttached}
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.move-attached-save.helpTitle")}
            helpContent={t("storage.actions.move-attached-save.helpContent")}
          >
            <Icon name="link" solid forButton />
            <Icon name="logout" solid forButton />
            {t("storage.actions.move-attached-save")}
          </ButtonWithDisabledPopover>
        )}

        {canGoToMain && attachedPkmVersion && (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={() =>
              navigate({
                search: ({ saves }) => ({
                  mainBoxIds: attachedPkmVersion && [attachedPkmVersion.boxId],
                  selected: {
                    id: attachedPkmVersion.id,
                  },
                  saves: {
                    ...saves,
                    [selectedPkm.saveId]: {
                      saveId: selectedPkm.saveId,
                      saveBoxIds: [selectedPkm.boxId],
                      order: getSaveOrder(saves, selectedPkm.saveId),
                    },
                  },
                }),
              })
            }
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.go-save.helpTitle")}
          >
            <Icon name="link" solid forButton />
            {t("storage.actions.go-save")}
          </ButtonWithDisabledPopover>
        )}

        <Button
          onClick={formEditMode.startEdit}
          disabled={formEditMode.editMode}
        >
          <Icon name="pen" solid forButton />
          {t("storage.actions.edit")}
        </Button>

        {canEvolve && (
          <ButtonWithConfirm
            anchor="right"
            bgColor={theme.bg.primary}
            onClick={async () => {
              const mutateResult = await evolvePkmsMutation.mutateAsync({
                params: {
                  saveId: selectedPkm.saveId,
                  ids: [selectedPkm.id],
                },
              });
              const savePkms = Object.values(
                mutateResult.data.saves?.find((save) => save.saveId === saveId)
                  ?.savePkms?.data ?? {},
              );
              const newId = savePkms.find(
                (pkm) =>
                  pkm.boxId === selectedPkm.boxId &&
                  pkm.boxSlot === selectedPkm.boxSlot,
              )?.id;
              if (newId) {
                navigate({
                  search: {
                    selected: {
                      id: newId,
                      saveId,
                    },
                  },
                });
              }
            }}
          >
            <Icon name="sparkles" solid forButton />
            {t("storage.actions.evolve")}
          </ButtonWithConfirm>
        )}

        {canDetach && attachedPkmVersion && (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={() =>
              mainPkmDetachSaveMutation.mutateAsync({
                params: {
                  pkmVersionIds: [attachedPkmVersion.id],
                },
              })
            }
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.detach-save.helpTitle")}
            helpContent={t("storage.actions.detach-save.helpContent")}
          >
            <Icon name="link" solid forButton />
            {t("storage.actions.detach-save")}
          </ButtonWithDisabledPopover>
        )}

        {canRemovePkm && (
          <ButtonWithConfirm
            anchor="right"
            bgColor={theme.bg.red}
            onClick={() =>
              savePkmsDeleteMutation.mutateAsync({
                saveId,
                params: {
                  pkmIds: [selectedPkm.id],
                },
              })
            }
          >
            <Icon name="trash" solid forButton />
            {t("storage.actions.release")}
          </ButtonWithConfirm>
        )}
      </div>
    </StorageItemSaveActionsContainer>
  );
};
