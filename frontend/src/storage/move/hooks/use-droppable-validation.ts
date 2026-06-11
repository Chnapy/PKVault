import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { getPkmSaveIndexOptions } from '../../../data/hooks/use-pkm-save-index';
import { getPkmVariantIndexOptions } from '../../../data/hooks/use-pkm-variant-index';
import { getSaveInfosGetAllQueryOptions } from '../../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetBoxesQueryOptions, getStorageGetMainBanksQueryOptions } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import type { DraggingSlotsStates, MoveSource, SlotsStates } from '../../../ui-new/interaction/move/state/move-state';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { BankContext } from '../../bank/bank-context';
import { useCurrentStorage } from '../../panel/storage-panel-context';
import { containerFns, type MoveContainerValue, type MoveParams } from '../move-container-fns';
import { buildSlotInfosBank } from '../validation/slot-infos/build-slot-infos-bank';
import { buildSlotInfosSlot } from '../validation/slot-infos/build-slot-infos-slot';
import type { SlotInfos } from '../validation/types';
import { getHelpText } from '../validation/utils/get-help-text';
import { validateDrop } from '../validation/validate-drop';

const emptySlotStates: DraggingSlotsStates = {
    rootItems: {},
    items: {},
};

/**
 * Gives drop validation - if current dragging pkm can be dropped to given target.
 * 
 * This hook expect data to be already fetched, for performance concerns.
 * Its trigger is done only when move state pass from idle to dragging.
 */
export const useDroppableValidation = () => {
    const getStorageLeft = useCurrentStorage('left').getStorage;
    const getStorageRight = useCurrentStorage('right').getStorage;

    const router = useRouter();

    const queryClient = useQueryClient();

    const { t } = useTranslate();

    // TODO mutualize with validate fn
    const prefetchQueries = async (source: MoveSource<MoveParams>) => {
        // console.log('call')
        const sourceContainer = source && containerFns.getContainerValue(source.containerId);
        const sourceSaveId = sourceContainer?.saveId;

        const queries = await Promise.all(([
            queryClient.fetchQuery(getPkmVariantIndexOptions()),
            queryClient.fetchQuery(getStorageGetBoxesQueryOptions()),
            sourceSaveId ? queryClient.fetchQuery(getPkmSaveIndexOptions(sourceSaveId ?? 0)) : Promise.resolve(),
            queryClient.fetchQuery(getSaveInfosGetAllQueryOptions()),
            sourceContainer ? queryClient.fetchQuery(getStorageGetBoxesQueryOptions({ saveId: sourceContainer?.saveId ?? undefined })) : Promise.resolve(),
            queryClient.fetchQuery(getStorageGetMainBanksQueryOptions()),

            // getPkmSaveIndexOptions(targetContainer.saveId ?? 0, {
            //     enabled: !!targetContainer.saveId,
            // }),
            // getStorageGetBoxesQueryOptions({ saveId: targetContainer.saveId ?? undefined }),
        ] as const));

        const mainBoxes = queries[ 1 ];
        const banks = queries[ 5 ];

        const search = router.latestLocation.search;
        // console.log('search', search)
        const storageLeft = getStorageLeft(search.storages);
        const storageRight = getStorageRight(search.storages);

        const selectedBankBoxes = BankContext.getSelectedBankBoxes(
            storageLeft?.saveId ? undefined : storageLeft?.boxId,
            storageRight?.saveId ? undefined : storageRight?.boxId,
            banks,
            mainBoxes,
        );

        const itemContainers = [ storageLeft, storageRight ]
            .filter(filterIsDefined)
            .map((storage, i) => {
                if (storage.saveId !== null || storage.boxId !== undefined || !selectedBankBoxes?.selectedBoxes.length)
                    return storage;

                const boxId = selectedBankBoxes.selectedBoxes.length > 1
                    ? selectedBankBoxes.selectedBoxes[ i ]?.idInt
                    : selectedBankBoxes.selectedBoxes[ 0 ]?.idInt;
                if (boxId === undefined)
                    return storage;

                return {
                    ...storage,
                    boxId,
                };
            })
            .filter((storage): storage is { saveId: number | null; boxId: number } => storage.boxId !== undefined)
            .map(({ saveId, boxId }): MoveContainerValue => saveId
                ? {
                    type: 'save-item',
                    saveId,
                    boxId: String(boxId),
                }
                : {
                    type: 'main-item',
                    boxId: String(boxId),
                });

        await Promise.all(itemContainers.flatMap(targetContainer => [
            targetContainer.saveId ? queryClient.fetchQuery(getPkmSaveIndexOptions(targetContainer.saveId ?? 0)) : Promise.resolve(),
            queryClient.fetchQuery(getStorageGetBoxesQueryOptions({ saveId: targetContainer.saveId ?? undefined })),
        ]));
    };

    const validate = React.useCallback((source: MoveSource<MoveParams>): DraggingSlotsStates => {
        // console.log('call')
        const sourceContainer = source && containerFns.getContainerValue(source.containerId);
        const sourceSaveId = sourceContainer?.saveId;

        const attached = source?.params?.attached ?? false;

        const sourceIds = [ ...source?.ids ?? [] ];
        const firstId = sourceIds[ 0 ];
        if (!firstId)
            return emptySlotStates;

        const pkmVariantIndex = queryClient.getQueryData(getPkmVariantIndexOptions().queryKey);
        const mainBoxes = queryClient.getQueryData(getStorageGetBoxesQueryOptions().queryKey);
        const sourcePkmSaveIndex = sourceSaveId
            ? queryClient.getQueryData(getPkmSaveIndexOptions(sourceSaveId).queryKey)
            : null;
        const saveInfosAll = queryClient.getQueryData(getSaveInfosGetAllQueryOptions().queryKey);
        const sourceBoxes = queryClient.getQueryData(getStorageGetBoxesQueryOptions({ saveId: sourceSaveId ?? undefined }).queryKey);
        const banks = queryClient.getQueryData(getStorageGetMainBanksQueryOptions().queryKey);

        const hasMissingRequiredSourceData = [ pkmVariantIndex, mainBoxes, sourcePkmSaveIndex, saveInfosAll, sourceBoxes, banks ]
            .some(d => d === undefined);
        if (hasMissingRequiredSourceData) {
            console.log('missing', [ pkmVariantIndex, mainBoxes, sourcePkmSaveIndex, saveInfosAll, sourceBoxes, banks ].map(Boolean))
            return emptySlotStates;
        }

        const sourcePkmIndex = sourceSaveId
            ? sourcePkmSaveIndex
            : pkmVariantIndex;

        const firstSourceSlot = sourcePkmIndex?.data.byId[ firstId ]?.boxSlot;
        if (firstSourceSlot === undefined) {
            console.log('no-first-slot')
            return emptySlotStates;
        }

        const search = router.latestLocation.search;
        // console.log('search', search)
        const storageLeft = getStorageLeft(search.storages);
        const storageRight = getStorageRight(search.storages);

        const selectedBankBoxes = BankContext.getSelectedBankBoxes(
            storageLeft?.saveId ? undefined : storageLeft?.boxId,
            storageRight?.saveId ? undefined : storageRight?.boxId,
            banks,
            mainBoxes,
        );

        const itemContainers = [ storageLeft, storageRight ]
            .filter(filterIsDefined)
            .map((storage, i) => {
                if (storage.saveId !== null || storage.boxId !== undefined || !selectedBankBoxes?.selectedBoxes.length)
                    return storage;

                const boxId = selectedBankBoxes.selectedBoxes.length > 1
                    ? selectedBankBoxes.selectedBoxes[ i ]?.idInt
                    : selectedBankBoxes.selectedBoxes[ 0 ]?.idInt;
                if (boxId === undefined)
                    return storage;

                return {
                    ...storage,
                    boxId,
                };
            })
            .filter((storage): storage is { saveId: number | null; boxId: number } => storage.boxId !== undefined)
            .map(({ saveId, boxId }): MoveContainerValue => saveId
                ? {
                    type: 'save-item',
                    saveId,
                    boxId: String(boxId),
                }
                : {
                    type: 'main-item',
                    boxId: String(boxId),
                });

        const bankContainers = banks?.data.map((bank): Extract<MoveContainerValue, { type: 'bank' }> => ({
            type: 'bank',
            bankId: bank.id,
        })) ?? [];

        const bankSlotStates: DraggingSlotsStates[ 'rootItems' ] = Object.fromEntries(
            bankContainers.map(targetContainer => {
                const slotInfosList = sourceIds.flatMap((sourceId): SlotInfos[] => {
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
                });

                const data = validateDrop(
                    { attached },
                    slotInfosList,
                    pkmVariantIndex!.data,
                );

                return [
                    containerFns.getContainerHash(targetContainer),
                    {
                        canDrop: data.canDrop,
                        helpText: data.canDrop ? undefined : getHelpText(data.reason, data.slotInfos, attached, t),
                        _disabledReason: data.canDrop ? undefined : data.reason,
                    } satisfies SlotsStates[ string ],
                ] as const;
            })
        );

        const itemSlotStates: DraggingSlotsStates[ 'items' ] = Object.fromEntries(
            itemContainers.map(targetContainer => {
                const containerHash = containerFns.getContainerHash(targetContainer);

                const targetPkmSaveIndex = targetContainer.saveId
                    ? queryClient.getQueryData(getPkmSaveIndexOptions(targetContainer.saveId).queryKey)
                    : null;
                const targetBoxes = queryClient.getQueryData(getStorageGetBoxesQueryOptions({ saveId: targetContainer.saveId ?? undefined }).queryKey);

                const hasMissingRequiredData = [ targetPkmSaveIndex, targetBoxes ]
                    .some(d => d === undefined);
                if (hasMissingRequiredData) {
                    // console.log('missing', hasMissingRequiredData)
                    return [ containerHash, {} ];
                }

                const targetBox = targetBoxes?.data.find(box => box.id === targetContainer.boxId);
                const targetBoxSlotCount = targetBox?.slotCount ?? 0;

                // const targetPkmIndex = targetContainer.saveId
                //     ? targetPkmSaveIndex
                //     : pkmVariantIndex;

                const allTargetSlots = new Array(targetBoxSlotCount).fill(0).map((_, i) => i);

                const slotsStates: DraggingSlotsStates[ 'items' ][ string ] = Object.fromEntries(
                    allTargetSlots.map(targetSlot => {
                        const slotInfosList = sourceIds.flatMap((sourceId): SlotInfos[] => {
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
                        });

                        const data = validateDrop(
                            { attached },
                            slotInfosList,
                            pkmVariantIndex!.data,
                        );

                        return [
                            targetSlot,
                            {
                                canDrop: data.canDrop,
                                helpText: data.canDrop ? undefined : getHelpText(data.reason, data.slotInfos, attached, t),
                                _disabledReason: data.canDrop ? undefined : data.reason,
                            } satisfies SlotsStates[ string ],
                        ];
                    })
                );

                return [ containerHash, slotsStates ] as const;
            })
        );
        // console.log('foo', itemSlotStates)
        return {
            rootItems: bankSlotStates,
            items: itemSlotStates,
        };
    }, [ getStorageLeft, getStorageRight, queryClient, router, t ]);

    const validateMonitored = React.useCallback<typeof validate>((...params) => {
        console.time('drop validate call');
        const result = validate(...params);
        console.timeEnd('drop validate call');

        return result;
    }, [ validate ]);

    return {
        validate: validateMonitored,
        prefetchQueries,
    };
};
