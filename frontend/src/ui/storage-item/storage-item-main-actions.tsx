import { css } from '@emotion/css';
import type React from "react";
import { usePkmVariantSlotInfos } from "../../data/hooks/use-pkm-variant-slot-infos";
import {
  useStorageEvolvePkms,
  useStorageMainCreatePkmVariant,
  useStorageMainDeletePkmVariant,
  useStorageMainPkmDetachSave,
} from "../../data/sdk/storage/storage.gen";
import { Route } from "../../routes/storage";
import { useMoveClickable } from '../../storage/move/hooks/use-move-clickable';
import { getSaveOrder } from "../../storage/util/get-save-order";
import { useTranslate } from "../../translate/i18n";
import { Button } from "../button/button";
import { ButtonWithConfirm } from "../button/button-with-confirm";
import { ButtonWithDisabledPopover } from "../button/button-with-disabled-popover";
import { Icon } from "../icon/icon";
import { StorageDetailsForm } from "../storage-item-details/storage-details-form";
import { theme } from "../theme";
import { StorageItemMainActionsContainer } from "./storage-item-main-actions-container";

export const StorageItemMainActions: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const selected = Route.useSearch({ select: (search) => search.selected });

  const formEditMode = StorageDetailsForm.useEditMode();

  const moveClickable = useMoveClickable(
    selected?.id ? [ selected.id ] : [],
    undefined,
  );

  const mainCreatePkmVariantMutation = useStorageMainCreatePkmVariant();
  const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
  const evolvePkmsMutation = useStorageEvolvePkms();
  const mainPkmVariantDeleteMutation = useStorageMainDeletePkmVariant();

  const variantInfos = usePkmVariantSlotInfos(selected?.id);
  if (!variantInfos) {
    return null;
  }

  const {
    mainVariant,
    attachedVariant,
    attachedSavePkm,
    canEditAll,
    canCreateVariants,
    canEvolveVariant,
    canDetach,
    canGoToSave,
    canRemoveVariants,
    pageSaves,
  } = variantInfos;

  return (
    <StorageItemMainActionsContainer pkmId={mainVariant.id}>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxWidth: 170,
        })}
      >
        {moveClickable.startDrag && (
          <Button onClick={moveClickable.startDrag}>
            <Icon name="logout" solid forButton />
            {t("storage.actions.move")}
          </Button>
        )}

        {moveClickable.startDragAttached && pageSaves.length > 0 && (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={moveClickable.startDragAttached}
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

        {canCreateVariants.map((generation) => (
          <ButtonWithDisabledPopover
            key={generation}
            as={Button}
            bgColor={theme.bg.primary}
            onClick={() =>
              mainCreatePkmVariantMutation.mutateAsync({
                params: {
                  generation: generation,
                  pkmVariantId: mainVariant.id,
                },
              })
            }
            showHelp
            anchor="right start"
            helpTitle={t("storage.actions.create-variant.helpTitle", {
              generation: generation,
            })}
            helpContent={t("storage.actions.create-variant.helpContent")}
          >
            <Icon name="plus" solid forButton />
            {t("storage.actions.create-variant", { generation: generation })}
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
                  saves: attachedVariant
                    ? {
                      ...saves,
                      [ attachedVariant.attachedSaveId! ]: {
                        saveId: attachedVariant.attachedSaveId!,
                        saveBoxIds: [ attachedSavePkm?.boxId ?? 0 ],
                        order: getSaveOrder(
                          saves,
                          attachedVariant.attachedSaveId!,
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

        {canEvolveVariant && (
          <ButtonWithConfirm
            anchor="right"
            bgColor={theme.bg.primary}
            onClick={async () => {
              const mutateResult = await evolvePkmsMutation.mutateAsync({
                params: {
                  ids: [ canEvolveVariant.id ],
                },
              });
              const mainPkms = Object.values(
                mutateResult.data.mainPkmVariants?.data ?? {},
              );
              const newId = mainPkms.find(
                (pkm) => pkm.boxKey === mainVariant.boxKey,
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
                  pkmVariantIds: [ attachedVariant!.id ],
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

        {canRemoveVariants.length > 0 && (
          <ButtonWithConfirm
            anchor="right"
            bgColor={theme.bg.red}
            onClick={() =>
              mainPkmVariantDeleteMutation.mutateAsync({
                params: {
                  pkmVariantIds: canRemoveVariants.map((variant) => variant.id),
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
