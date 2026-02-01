import type React from "react";
import { usePkmVersionSlotInfos } from "../../data/hooks/use-pkm-version-slot-infos";
import {
  useStorageEvolvePkms,
  useStorageMainCreatePkmVersion,
  useStorageMainDeletePkmVersion,
  useStorageMainPkmDetachSave,
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
import { StorageItemMainActionsContainer } from "./storage-item-main-actions-container";
import { css } from '@emotion/css';

export const StorageItemMainActions: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const selected = Route.useSearch({ select: (search) => search.selected });

  const formEditMode = StorageDetailsForm.useEditMode();

  const moveClickable = StorageMoveContext.useClickable(
    selected?.id ? [ selected.id ] : [],
    undefined,
  );

  const mainCreatePkmVersionMutation = useStorageMainCreatePkmVersion();
  const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
  const evolvePkmsMutation = useStorageEvolvePkms();
  const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();

  const versionInfos = usePkmVersionSlotInfos(selected?.id);
  if (!versionInfos) {
    return null;
  }

  const {
    mainVersion,
    attachedVersion,
    attachedSavePkm,
    canEditAll,
    canCreateVersions,
    canEvolveVersion,
    canDetach,
    canGoToSave,
    canRemoveVersions,
    pageSaves,
  } = versionInfos;

  return (
    <StorageItemMainActionsContainer pkmId={mainVersion.id}>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxWidth: 170,
        })}
      >
        {moveClickable.onClick && (
          <Button onClick={moveClickable.onClick}>
            <Icon name="logout" solid forButton />
            {t("storage.actions.move")}
          </Button>
        )}

        {moveClickable.onClickAttached && pageSaves.length > 0 && (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={moveClickable.onClickAttached}
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.move-attached-main.helpTitle")}
            helpContent={t("storage.actions.move-attached-main.helpContent")}
          >
            <Icon name="link" solid forButton />
            <Icon name="logout" solid forButton />
            {t("storage.actions.move-attached-main")}
          </ButtonWithDisabledPopover>
        )}

        {canCreateVersions.map((generation) => (
          <ButtonWithDisabledPopover
            key={generation}
            as={Button}
            bgColor={theme.bg.primary}
            onClick={() =>
              mainCreatePkmVersionMutation.mutateAsync({
                params: {
                  generation: generation,
                  pkmVersionId: mainVersion.id,
                },
              })
            }
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.create-version.helpTitle", {
              generation: generation,
            })}
            helpContent={t("storage.actions.create-version.helpContent")}
          >
            <Icon name="plus" solid forButton />
            {t("storage.actions.create-version", { generation: generation })}
          </ButtonWithDisabledPopover>
        ))}

        {canGoToSave && (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={() => {
              navigate({
                search: ({ saves }) => ({
                  selected: attachedSavePkm && {
                    saveId: attachedSavePkm.saveId,
                    id: attachedSavePkm.id,
                  },
                  saves: attachedVersion
                    ? {
                      ...saves,
                      [ attachedVersion.attachedSaveId! ]: {
                        saveId: attachedVersion.attachedSaveId!,
                        saveBoxIds: [ attachedSavePkm?.boxId ?? 0 ],
                        order: getSaveOrder(
                          saves,
                          attachedVersion.attachedSaveId!,
                        ),
                      },
                    }
                    : saves,
                }),
              });
            }}
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.go-main.helpTitle")}
          >
            <Icon name="link" solid forButton />
            {t("storage.actions.go-main")}
          </ButtonWithDisabledPopover>
        )}

        {canEditAll && (
          <Button
            onClick={formEditMode.startEdit}
            disabled={formEditMode.editMode}
          >
            <Icon name="pen" solid forButton />
            {t("storage.actions.edit")}
          </Button>
        )}

        {canEvolveVersion && (
          <ButtonWithConfirm
            anchor="right"
            bgColor={theme.bg.primary}
            onClick={async () => {
              const mutateResult = await evolvePkmsMutation.mutateAsync({
                params: {
                  ids: [ canEvolveVersion.id ],
                },
              });
              const mainPkms = Object.values(
                mutateResult.data.mainPkmVersions?.data ?? {},
              );
              const newId = mainPkms.find(
                (pkm) => pkm.boxKey === mainVersion.boxKey,
              )?.id;
              if (newId) {
                navigate({
                  search: {
                    selected: {
                      id: newId,
                      saveId: undefined,
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

        {canDetach && (
          <ButtonWithDisabledPopover
            as={ButtonWithConfirm}
            onClick={() =>
              mainPkmDetachSaveMutation.mutateAsync({
                params: {
                  pkmVersionIds: [ attachedVersion!.id ],
                },
              })
            }
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.detach-main.helpTitle")}
            helpContent={t("storage.actions.detach-main.helpContent")}
          >
            <Icon name="link" solid forButton />
            {t("storage.actions.detach-main")}
          </ButtonWithDisabledPopover>
        )}

        {canRemoveVersions.length > 0 && (
          <ButtonWithConfirm
            anchor="right"
            bgColor={theme.bg.red}
            onClick={() =>
              mainPkmVersionDeleteMutation.mutateAsync({
                params: {
                  pkmVersionIds: canRemoveVersions.map((version) => version.id),
                },
              })
            }
          >
            <Icon name="trash" solid forButton />
            {t("storage.actions.release")}
          </ButtonWithConfirm>
        )}
      </div>
    </StorageItemMainActionsContainer>
  );
};
