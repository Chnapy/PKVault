import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import {
    getStorageGetBoxesQueryKey,
    useStorageGetBoxes,
    useStorageGetMainBanks,
    useStorageUpdateMainBox,
    type storageGetBoxesResponseSuccess
} from '../../data/sdk/storage/storage.gen';
import { UIBoxEdit } from '../../ui-new/storage/storage-panel/box-list/ui-box-edit';
import { BankContext } from '../bank/bank-context';

const queryKeys = [
    getStorageGetBoxesQueryKey(),
    getStorageGetBoxesQueryKey({ saveId: undefined })
];

export const StorageBoxEdit: React.FC<{ boxId: string }> = ({ boxId }) => {
    const queryClient = useQueryClient();

    const queryDataRef = React.useRef<storageGetBoxesResponseSuccess>(null);

    const boxUpdateMutation = useStorageUpdateMainBox();
    const banksQuery = useStorageGetMainBanks();
    const boxesQuery = useStorageGetBoxes();

    const minSlotCountQuery = usePkmVariantIndex(data =>
        Math.max(0, ...Object.keys(data.data.byBox[ box?.idInt ?? -1 ] ?? {}).map(Number)) + 1
    );
    const minSlotCount = minSlotCountQuery.data ?? 0;

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selected = selectedBankBoxes.data?.selectedBoxes?.some(box => box.id === boxId) ?? false;

    const box = boxesQuery.data?.data.find(box => box.id === boxId);
    const boxes = [ ...(boxesQuery.data?.data ?? []) ].filter(b => b.bankId === box?.bankId).sort((b1, b2) => (b1.order < b2.order ? -1 : 1));

    React.useEffect(() => {
        return () => {
            if (queryDataRef.current) {
                queryKeys.forEach(queryKey =>
                    queryClient.setQueryData(queryKey, queryDataRef.current)
                );
            }
        };
    }, [ queryClient ]);

    return box && <UIBoxEdit
        boxId={boxId}
        selected={selected}
        defaultValues={{
            bankId: box.bankId!,
            boxName: box.name,
            type: box.type,
            slotCount: box.slotCount,
            order: box.order,
        }}
        boxList={boxes.map(({ id, order }) => ({ id, order }))}
        bankList={banksQuery.data?.data.map(({ id, name }) => ({ id, name })) ?? []}
        minSlotCount={minSlotCount}
        onOrderChange={order => {
            queryKeys.forEach(queryKey => queryClient.setQueryData(queryKey, (data: storageGetBoxesResponseSuccess) => {
                if (!data)
                    queryDataRef.current = data;

                return {
                    ...data,
                    data: data?.data.map(b => {
                        if (b.id !== boxId) {
                            return b;
                        }

                        return {
                            ...b,
                            order,
                        };
                    }),
                };
            }));
        }}
        onSubmit={async ({ bankId, type, boxName, slotCount, order }) => {
            await boxUpdateMutation.mutateAsync({
                boxId,
                params: {
                    type,
                    boxName,
                    slotCount,
                    order,
                    bankId,
                },
            });
        }}
    />;
};
