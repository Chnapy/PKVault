import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes, useStorageGetMainBanks } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { useMoveContext } from '../../../ui-new/interaction/move/context/use-move-context';
import type { MoveContainerValue, MoveParams } from '../state/move-select-impl-provider';
import { buildSlotInfosBank } from '../validation/slot-infos/build-slot-infos-bank';
import { buildSlotInfosSlot } from '../validation/slot-infos/build-slot-infos-slot';
import type { DropRefusalReason, SlotInfos } from '../validation/types';
import { getHelpText } from '../validation/utils/get-help-text';
import { validateDrop } from '../validation/validate-drop';

export type UseDroppableValidationReturn = {
    canDrop?: boolean;
    _disabledReason?: DropRefusalReason;
    helpText?: string;
};

export const useDroppableValidation = (targetSlot: number, targetContainer: MoveContainerValue): UseDroppableValidationReturn => {
    const { useMoveStore, getContainerValue } = useMoveContext<MoveContainerValue, MoveParams>();

    const { t } = useTranslate();

    const source = useMoveStore(({ state }) => state.status === 'dragging'
        ? state.source
        : undefined);

    const sourceContainer = source && getContainerValue(source.containerId);

    const sourceIds = [ ...source?.ids ?? [] ];
    const firstId = sourceIds[ 0 ];

    const saveInfosAll = useSaveInfosGetAll();

    const pkmVariantIndex = usePkmVariantIndex();
    const sourcePkmSaveIndex = usePkmSaveIndex(sourceContainer?.saveId ?? 0);
    const targetPkmSaveIndex = usePkmSaveIndex(targetContainer?.saveId ?? 0);
    const sourceBoxesQuery = useStorageGetBoxes({ saveId: sourceContainer?.saveId ?? undefined });
    const targetBoxesQuery = useStorageGetBoxes({ saveId: targetContainer?.saveId ?? undefined });
    const banksQuery = useStorageGetMainBanks();

    const firstSourceSlot = usePkmIndex(
        sourceContainer?.saveId ?? null,
        data => firstId
            ? data.data.byId[ firstId ]?.boxSlot
            : undefined,
    );

    if (!source || !pkmVariantIndex.data || !sourceContainer)
        return {};

    const slotInfosList = sourceIds.flatMap((sourceId): SlotInfos[] => {
        switch (targetContainer.type) {
            case 'bank':
                return buildSlotInfosBank(
                    targetContainer.bankId,
                    sourceId,
                    sourceContainer.saveId ?? undefined,
                    pkmVariantIndex.data?.data,
                    sourceContainer.saveId ? sourcePkmSaveIndex.data?.data : undefined,
                    saveInfosAll.data?.data ?? {},
                    Object.fromEntries(
                        sourceBoxesQuery.data?.data
                            .map(box => [ box.idInt, box ]) ?? []
                    ),
                    Object.fromEntries(
                        banksQuery.data?.data
                            .map(bank => [ bank.idInt, bank ]) ?? []
                    ),
                );
            default:
                return buildSlotInfosSlot(
                    Number(targetContainer.boxId),
                    targetSlot,
                    firstSourceSlot.data ?? -1,
                    sourceId,
                    sourceContainer.saveId,
                    targetContainer.saveId,
                    () => pkmVariantIndex.data?.data,
                    () => sourceContainer.saveId ? sourcePkmSaveIndex.data?.data : undefined,
                    () => targetContainer.saveId ? targetPkmSaveIndex.data?.data : undefined,
                    () => saveInfosAll.data?.data ?? {},
                    () => Object.fromEntries(
                        sourceBoxesQuery.data?.data
                            .map(box => [ box.idInt, box ]) ?? []
                    ),
                    () => Object.fromEntries(
                        targetBoxesQuery.data?.data
                            .map(box => [ box.idInt, box ]) ?? []
                    ),
                );
        }
    });

    const attached = source.params?.attached ?? false;

    const validation = validateDrop(
        {
            status: 'dragging',
            source: {
                ids: [ ...source.ids ],
                saveId: sourceContainer.saveId ?? undefined,
                attached,
            },
        },
        slotInfosList,
        pkmVariantIndex.data.data,
    );

    const helpText = validation.canDrop
        ? undefined
        : getHelpText(validation.reason, validation.slotInfos, attached, t);

    return {
        canDrop: validation.canDrop,
        _disabledReason: !validation.canDrop ? validation.reason : undefined,
        helpText,
    };
};
