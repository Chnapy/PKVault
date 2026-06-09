import { useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { getPkmSaveIndexOptions } from '../../../data/hooks/use-pkm-save-index';
import { getPkmVariantIndexOptions } from '../../../data/hooks/use-pkm-variant-index';
import { getSaveInfosGetAllQueryOptions } from '../../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetBoxesQueryOptions, getStorageGetMainBanksQueryOptions } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { useMoveContext } from '../../../ui-new/interaction/move/context/use-move-context';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue, MoveParams } from '../move-container-fns';
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

/**
 * Gives drop validation - if current dragging pkm can be dropped to given target.
 * 
 * This hook expect data to be already fetched, for performance concerns.
 * Its trigger is done only when move state pass from idle to dragging.
 */
export const useDroppableValidation = (targetSlot: number, targetContainer: MoveContainerValue): UseDroppableValidationReturn => {
    const queryClient = useQueryClient();

    const { useMoveStore, getContainerValue } = useMoveContext<MoveContainerValue, MoveParams>();

    const { t } = useTranslate();

    return useMoveStore(
        useSelectCallback(({ state }): UseDroppableValidationReturn => {
            if (state.status !== 'dragging')
                return {};

            const source = state.source;

            const sourceContainer = source && getContainerValue(source.containerId);
            const sourceSaveId = sourceContainer?.saveId;

            const attached = source?.params?.attached ?? false;

            const sourceIds = [ ...source?.ids ?? [] ];
            const firstId = sourceIds[ 0 ];
            if (!firstId)
                return {};

            const queriesOptions = [
                getPkmVariantIndexOptions(),
                getPkmSaveIndexOptions(sourceSaveId ?? 0, {
                    enabled: !!sourceSaveId,
                }),
                getSaveInfosGetAllQueryOptions(),
                getStorageGetBoxesQueryOptions({ saveId: sourceContainer?.saveId ?? undefined }, {
                    query: { enabled: !!sourceContainer }
                }),
                getStorageGetMainBanksQueryOptions(),
                getPkmSaveIndexOptions(targetContainer.saveId ?? 0, {
                    enabled: !!targetContainer.saveId,
                }),
                getStorageGetBoxesQueryOptions({ saveId: targetContainer.saveId ?? undefined }),
            ] as const;

            // this part is required for testing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queriesOptions.forEach((queryOptions: UseQueryOptions<any, any>) => {
                if (queryOptions.enabled !== false)
                    queryClient.prefetchQuery(queryOptions);
            });

            const pkmVariantIndex = queryClient.getQueryData(getPkmVariantIndexOptions().queryKey);
            const sourcePkmSaveIndex = sourceSaveId
                ? queryClient.getQueryData(getPkmSaveIndexOptions(sourceSaveId).queryKey)
                : null;
            const saveInfosAll = queryClient.getQueryData(getSaveInfosGetAllQueryOptions().queryKey);
            const sourceBoxes = queryClient.getQueryData(getStorageGetBoxesQueryOptions({ saveId: sourceSaveId ?? undefined }).queryKey);
            const banks = queryClient.getQueryData(getStorageGetMainBanksQueryOptions().queryKey);
            const targetPkmSaveIndex = targetContainer.saveId
                ? queryClient.getQueryData(getPkmSaveIndexOptions(targetContainer.saveId).queryKey)
                : null;
            const targetBoxes = queryClient.getQueryData(getStorageGetBoxesQueryOptions({ saveId: targetContainer.saveId ?? undefined }).queryKey);

            const hasMissingRequiredData = [ pkmVariantIndex, sourcePkmSaveIndex, saveInfosAll, sourceBoxes, banks, targetPkmSaveIndex, targetBoxes ]
                .some(d => d === undefined);

            if (hasMissingRequiredData) {
                // console.log('missing', hasMissingRequiredData)
                return {};
            }

            const firstSourceSlot = (sourceSaveId
                ? sourcePkmSaveIndex?.data.byId[ firstId ]
                : pkmVariantIndex?.data.byId[ firstId ]
            )?.boxSlot;
            if (firstSourceSlot === undefined) {
                // console.log('no-first-slot')
                return {};
            }

            const slotInfosList = sourceIds.flatMap((sourceId): SlotInfos[] => {
                switch (targetContainer.type) {
                    case 'bank':
                        return buildSlotInfosBank(
                            targetContainer.bankId,
                            sourceId,
                            sourceSaveId,
                            pkmVariantIndex!.data,
                            sourceSaveId ? sourcePkmSaveIndex!.data : undefined,
                            saveInfosAll!.data,
                            Object.fromEntries(
                                sourceBoxes!.data.map(box => [ box.idInt, box ]) ?? []
                            ),
                            Object.fromEntries(
                                banks!.data.map(bank => [ bank.idInt, bank ]) ?? []
                            ),
                        );
                    default:
                        return buildSlotInfosSlot(
                            Number(targetContainer.boxId),
                            targetSlot,
                            firstSourceSlot,
                            sourceId,
                            sourceSaveId,
                            targetContainer.saveId,
                            pkmVariantIndex!.data,
                            sourceSaveId ? sourcePkmSaveIndex!.data : undefined,
                            targetContainer.saveId ? targetPkmSaveIndex?.data : undefined,
                            saveInfosAll!.data ?? {},
                            Object.fromEntries(
                                sourceBoxes!.data.map(box => [ box.idInt, box ]) ?? []
                            ),
                            Object.fromEntries(
                                targetBoxes!.data.map(box => [ box.idInt, box ]) ?? []
                            ),
                        );
                }
            });

            const data = validateDrop(
                { attached },
                slotInfosList,
                pkmVariantIndex!.data,
            );

            // console.log('RESULT', data)
            return data.canDrop
                ? {
                    canDrop: true,
                    _disabledReason: undefined,
                    helpText: undefined,
                }
                : {
                    canDrop: false,
                    _disabledReason: data.reason,
                    helpText: getHelpText(data.reason, data.slotInfos, attached, t),
                };
        }, [ getContainerValue, queryClient, t, targetContainer.bankId, targetContainer.boxId, targetContainer.saveId, targetContainer.type, targetSlot ]));
};
