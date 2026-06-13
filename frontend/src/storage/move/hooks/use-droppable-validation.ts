import { useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { getPkmSaveIndexOptions } from '../../../data/hooks/use-pkm-save-index';
import { getPkmVariantIndexOptions } from '../../../data/hooks/use-pkm-variant-index';
import { getSaveInfosGetAllQueryOptions } from '../../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetBoxesQueryOptions, getStorageGetMainBanksQueryOptions, type storageGetBoxesResponseSuccess, type storageGetMainBanksResponseSuccess } from '../../../data/sdk/storage/storage.gen';
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type QuerySelectData<O> = O extends UseQueryOptions<any, any, infer D>
        ? D
        : never;

    const getCommonData = React.useCallback((source: MoveSource<MoveParams>) => {
        const sourceContainer = source && containerFns.getContainerValue(source.containerId);
        const sourceSaveId = sourceContainer?.saveId;

        const queriesOptions = {
            pkmVariantIndex: getPkmVariantIndexOptions(),
            mainBoxes: getStorageGetBoxesQueryOptions(),
            sourcePkmSaveIndex: sourceSaveId
                ? getPkmSaveIndexOptions(sourceSaveId)
                : null,
            saveInfosAll: getSaveInfosGetAllQueryOptions(),
            sourceBoxes: getStorageGetBoxesQueryOptions({ saveId: sourceSaveId ?? undefined }),
            banks: getStorageGetMainBanksQueryOptions(),
        } as const;

        const getItemsContainers = (
            banks: storageGetMainBanksResponseSuccess | undefined,
            mainBoxes: storageGetBoxesResponseSuccess | undefined
        ) => {
            const search = router.latestLocation.search;

            const storageLeft = getStorageLeft(search.storages);
            const storageRight = getStorageRight(search.storages);

            const selectedBankBoxes = BankContext.getSelectedBankBoxes(
                storageLeft?.saveId ? undefined : storageLeft?.boxId,
                storageRight?.saveId ? undefined : storageRight?.boxId,
                banks,
                mainBoxes,
            );

            return [ storageLeft, storageRight ]
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
                    })
                .map(targetContainer => [
                    targetContainer,
                    {
                        targetPkmSaveIndex: targetContainer.saveId
                            ? getPkmSaveIndexOptions(targetContainer.saveId)
                            : null,
                        targetBoxes: getStorageGetBoxesQueryOptions({ saveId: targetContainer.saveId ?? undefined }),
                    } as const,
                ] as const);
        };

        return {
            sourceSaveId,
            queriesOptions,
            getItemsContainers,
        };
    }, [ getStorageLeft, getStorageRight, router ]);

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
        const {
            queriesOptions,
            getItemsContainers,
        } = getCommonData(source);

        const { mainBoxes, banks } = Object.fromEntries(await Promise.all(
            Object.entries(queriesOptions).map(async ([ key, options ]) => [
                key,
                options
                    ? await queryClient.fetchQuery(options as never)
                    : Promise.resolve(null),
            ])
        )) as QueriesDataMap;

        await Promise.all(
            getItemsContainers(banks, mainBoxes).flatMap(([ targetContainer, options ]) => [
                options.targetPkmSaveIndex ? queryClient.fetchQuery(options.targetPkmSaveIndex) : Promise.resolve(),
                queryClient.fetchQuery(options.targetBoxes),
            ])
        );
    };

    const validate = React.useCallback((source: MoveSource<MoveParams>): DraggingSlotsStates => {
        const {
            sourceSaveId,
            queriesOptions,
            getItemsContainers,
        } = getCommonData(source);

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

        const sourcePkmIndex = sourceSaveId
            ? sourcePkmSaveIndex
            : pkmVariantIndex;

        const firstSourceSlot = sourcePkmIndex?.data.byId[ firstId ]?.boxSlot;
        if (firstSourceSlot === undefined) {
            console.error('drop-validation - no-first-slot')
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

        return {
            rootItems: bankSlotStates,
            items: itemSlotStates,
        };
    }, [ getCommonData, queryClient, t ]);

    return {
        validate,
        prefetchQueries,
    };
};
