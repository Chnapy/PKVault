import { useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { getPkmSaveIndexOptions } from '../../../data/hooks/use-pkm-save-index';
import { getPkmVariantIndexOptions } from '../../../data/hooks/use-pkm-variant-index';
import { BoxType } from '../../../data/sdk/model';
import { getSaveInfosGetAllQueryOptions } from '../../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetBoxesQueryOptions, getStorageGetInventoryItemsQueryOptions, getStorageGetMainBanksQueryOptions, type storageGetBoxesResponseSuccess, type storageGetMainBanksResponseSuccess } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import type { DraggingSlotsStates, MoveSource, SlotsStates } from '../../../ui/interaction/move/state/move-state';
import { useStorageModeContext } from '../../../ui/inventory/context/storage-mode-context';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { BankContext } from '../../bank/bank-context';
import { getFinalBox } from '../../panel/hooks/utils/get-final-box';
import { useCurrentStorage } from '../../panel/storage-panel-context';
import { containerFns, type MoveContainerValue, type MoveParams } from '../move-container-fns';
import type { IsItemCompatibleFn } from '../validation/rules/validate-common';
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
export const useDroppableValidation = (isItemCompatible: IsItemCompatibleFn) => {
    const getStorageLeft = useCurrentStorage('left').getStorage;
    const getStorageRight = useCurrentStorage('right').getStorage;

    const router = useRouter();

    const queryClient = useQueryClient();

    const { t } = useTranslate();

    const { useMoveStore } = useStorageModeContext();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type QuerySelectData<O> = O extends UseQueryOptions<any, any, infer D>
        ? D
        : never;

    const getCommonData = React.useCallback((source: MoveSource<MoveParams>) => {
        const sourceContainer = containerFns.getContainerValue(source.containerId);
        const sourceSaveId = sourceContainer.saveId;

        const search = router.latestLocation.search;

        const storageLeft = getStorageLeft(search.storages);
        const storageRight = getStorageRight(search.storages);

        const storages = [ storageLeft, storageRight ].filter(filterIsDefined);

        const storagesOptions = storages
            .map(({ saveId }) => ({
                targetPkmSaveIndex: saveId
                    ? getPkmSaveIndexOptions(saveId)
                    : null,
                targetBoxes: getStorageGetBoxesQueryOptions({ saveId: saveId ?? undefined }),
            } as const));

        const queriesOptions = {
            pkmVariantIndex: getPkmVariantIndexOptions(),
            mainBoxes: getStorageGetBoxesQueryOptions(),
            sourcePkmSaveIndex: sourceSaveId
                ? getPkmSaveIndexOptions(sourceSaveId)
                : null,
            sourceInventory: sourceContainer.type === 'inventory-item'
                ? getStorageGetInventoryItemsQueryOptions({ saveId: sourceSaveId ?? undefined })
                : null,
            saveInfosAll: getSaveInfosGetAllQueryOptions(),
            sourceBoxes: getStorageGetBoxesQueryOptions({ saveId: sourceSaveId ?? undefined }),
            banks: getStorageGetMainBanksQueryOptions(),

            storageLeftPkmSaveIndex: storagesOptions[ 0 ]?.targetPkmSaveIndex,
            storageLeftBoxes: storagesOptions[ 0 ]?.targetBoxes,
            storageRightPkmSaveIndex: storagesOptions[ 1 ]?.targetPkmSaveIndex,
            storageRightBoxes: storagesOptions[ 1 ]?.targetBoxes,
        } as const;

        const getItemsContainers = (
            banks: storageGetMainBanksResponseSuccess | undefined,
            mainBoxes: storageGetBoxesResponseSuccess | undefined
        ) => {
            const selectedBankBoxes = BankContext.getSelectedBankBoxes(
                storageLeft?.saveId ? undefined : storageLeft?.boxId,
                storageRight?.saveId ? undefined : storageRight?.boxId,
                banks,
                mainBoxes,
            );

            return storages
                .map((storage, i) => {
                    const otherStorage = storages[ (i + 1) % 2 ];
                    const box = getFinalBox(
                        i,
                        storage,
                        otherStorage,
                        queryClient.getQueryData(storagesOptions[ i ]!.targetBoxes.queryKey),
                        selectedBankBoxes?.selectedBoxes ?? [],
                    );

                    return {
                        ...storage,
                        boxId: box?.idInt,
                        isInventory: box?.type === BoxType.Inventory,
                    };
                })
                .map(({ saveId, boxId, isInventory }): MoveContainerValue => isInventory
                    ? {
                        type: 'inventory-item',
                        saveId: saveId ?? undefined,
                        boxId: String(boxId),
                    }
                    : saveId
                        ? {
                            type: 'save-item',
                            saveId,
                            boxId: String(boxId),
                        }
                        : {
                            type: 'main-item',
                            boxId: String(boxId),
                        })
                .map((targetContainer, i) => [
                    targetContainer,
                    storagesOptions[ i ]!,
                ] as const);
        };

        return {
            sourceContainer,
            sourceSaveId,
            queriesOptions,
            getItemsContainers,
        };
    }, [ getStorageLeft, getStorageRight, queryClient, router ]);

    type QueriesOptions = ReturnType<typeof getCommonData>[ 'queriesOptions' ];
    type QueriesDataMap = {
        [ key in keyof QueriesOptions ]: null extends QueriesOptions[ key ]
        ? QuerySelectData<QueriesOptions[ key ]> | null
        : QuerySelectData<QueriesOptions[ key ]>
    };

    /**
     * For testing purpose
     */
    const prefetchQueries = async (source: MoveSource<MoveParams>) => {
        const { queriesOptions } = getCommonData(source);

        await Promise.all(
            Object.entries(queriesOptions).map(async ([ key, options ]) => [
                key,
                options
                    ? await queryClient.fetchQuery(options as never)
                    : Promise.resolve(null),
            ])
        );
    };

    const validate = React.useCallback((source: MoveSource<MoveParams>): DraggingSlotsStates => {
        const {
            sourceContainer,
            sourceSaveId,
            queriesOptions,
            getItemsContainers,
        } = getCommonData(source);

        const mode = useMoveStore.getState().state;

        const attached = source?.params?.attached ?? false;

        const sourceIds = [ ...source?.ids ?? [] ];
        const firstId = sourceIds[ 0 ];
        if (!firstId)
            return emptySlotStates;

        const data = Object.fromEntries(
            Object.entries(queriesOptions).map(([ key, options ]) => [
                key,
                options
                    ? queryClient.getQueryData(options.queryKey)
                    : null,
            ])
        ) as QueriesDataMap;

        const {
            pkmVariantIndex,
            mainBoxes,
            sourcePkmSaveIndex,
            sourceInventory,
            saveInfosAll,
            sourceBoxes,
            banks,
        } = data;

        if (!pkmVariantIndex)
            throw new Error('NO PKM-VARIANT');

        const hasMissingRequiredSourceData = Object.values(data).some(d => d === undefined);
        if (hasMissingRequiredSourceData) {
            console.error('drop-validation - Missing required source data', Object.fromEntries(
                Object.entries(data).map(([ key, data ]) => [ key, !!data ])
            ));
            return emptySlotStates;
        }

        const getSlot = (id: string) => {
            if (sourceContainer.type === 'inventory-item')
                return Object.values(sourceInventory?.data ?? {}).find(item => item.id === id)?.boxSlot;

            const index = sourceSaveId
                ? sourcePkmSaveIndex?.data.byId
                : pkmVariantIndex.data.byId;
            return index?.[ id ]?.boxSlot;
        };

        const firstSourceSlot = getSlot(firstId);
        if (firstSourceSlot === undefined) {
            console.error('drop-validation - no-first-slot', { source })
            return emptySlotStates;
        }

        const itemContainers = getItemsContainers(banks, mainBoxes);

        const bankContainers = banks?.data.map((bank): Extract<MoveContainerValue, { type: 'bank' }> => ({
            type: 'bank',
            bankId: bank.id,
        })) ?? [];

        const bankSlotStates: DraggingSlotsStates[ 'rootItems' ] = Object.fromEntries(
            bankContainers.map(targetContainer => {
                const slotInfosList = sourceIds.flatMap((sourceId): SlotInfos[] => {
                    return buildSlotInfosBank(
                        mode,
                        targetContainer.bankId,
                        sourceId,
                        sourceSaveId,
                        pkmVariantIndex!.data,
                        sourceSaveId ? sourcePkmSaveIndex!.data : undefined,
                        sourceInventory?.data,
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
                    isItemCompatible,
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
            itemContainers.map(([ targetContainer, options ]) => {
                const containerHash = containerFns.getContainerHash(targetContainer);

                const targetPkmSaveIndex = options.targetPkmSaveIndex
                    ? queryClient.getQueryData(options.targetPkmSaveIndex.queryKey)
                    : null;
                const targetBoxes = queryClient.getQueryData(options.targetBoxes.queryKey);

                const hasMissingRequiredData = [ targetPkmSaveIndex, targetBoxes ].some(d => d === undefined);
                if (hasMissingRequiredData) {
                    console.error('drop-validation - Missing required target data', targetContainer, Object.fromEntries(
                        Object.entries({ targetPkmSaveIndex, targetBoxes }).map(([ key, data ]) => [ key, !!data ])
                    ));
                    return [ containerHash, {} ];
                }

                const targetBox = targetBoxes?.data.find(box => box.id === targetContainer.boxId);
                const targetBoxSlotCount = targetBox?.slotCount ?? 0;

                const allTargetSlots = new Array(targetBoxSlotCount).fill(0).map((_, i) => i);

                const slotsStates: DraggingSlotsStates[ 'items' ][ string ] = Object.fromEntries(
                    allTargetSlots.map(targetSlot => {
                        const slotInfosList = sourceIds.flatMap((sourceId): SlotInfos[] => {
                            return buildSlotInfosSlot(
                                mode,
                                Number(targetContainer.boxId),
                                targetSlot,
                                firstSourceSlot,
                                sourceId,
                                sourceSaveId,
                                targetContainer.saveId,
                                pkmVariantIndex!.data,
                                sourceSaveId ? sourcePkmSaveIndex!.data : undefined,
                                sourceInventory?.data,
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
                            isItemCompatible,
                        );

                        // console.log('drop-results', targetContainer, targetSlot, data);

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

        return {
            rootItems: bankSlotStates,
            items: itemSlotStates,
        };
    }, [ getCommonData, isItemCompatible, queryClient, t, useMoveStore ]);

    return {
        validate,
        prefetchQueries,
    };
};
