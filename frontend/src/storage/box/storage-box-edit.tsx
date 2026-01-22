import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { usePkmVersionIndex } from '../../data/hooks/use-pkm-version-index';
import { BoxType, type StorageUpdateMainBoxParams } from '../../data/sdk/model';
import {
    getStorageGetBoxesQueryKey,
    useStorageGetMainBanks,
    useStorageGetBoxes,
    useStorageUpdateMainBox,
    type storageGetBoxesResponse200,
} from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { NumberInput } from '../../ui/input/number-input';
import { SelectNumberInput, SelectStringInput } from '../../ui/input/select-input';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';
import { BoxTypeIcon } from './box-type-icon';

export const StorageBoxEdit: React.FC<{ boxId: string; close: () => void }> = ({ boxId, close }) => {
    const { t } = useTranslate();

    const queryClient = useQueryClient();

    const boxUpdateMutation = useStorageUpdateMainBox();
    const banksQuery = useStorageGetMainBanks();
    const boxesQuery = useStorageGetBoxes();
    const pkmsQuery = usePkmVersionIndex();

    const box = boxesQuery.data?.data.find(box => box.id === boxId);
    const boxes = [ ...(boxesQuery.data?.data ?? []) ].filter(b => b.bankId === box?.bankId).sort((b1, b2) => (b1.order < b2.order ? -1 : 1));

    const minSlotCount = Math.max(0, ...Object.keys(pkmsQuery.data?.data.byBox[ box?.idInt ?? -1 ] ?? {}).map(Number)) + 1;

    const { register, handleSubmit, formState, watch, setValue } = useForm<StorageUpdateMainBoxParams>({
        defaultValues: {
            type: box?.type,
            boxName: box?.name,
            slotCount: box?.slotCount,
            order: box?.order,
            bankId: box?.bankId,
        },
    });

    const watchType = watch('type');
    const watchName = watch('boxName');
    // const watchSlotCount = watch('slotCount');
    const watchOrder = watch('order');
    const watchBankId = watch('bankId');

    const previousBox = [ ...boxes ].reverse().find(b => b.id !== boxId && b.order <= watchOrder);
    const nextBox = boxes.find(b => b.id !== boxId && b.order >= watchOrder);

    const onSubmit = handleSubmit(async ({ type, boxName, slotCount, order, bankId }) => {
        if (!box) {
            return;
        }

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
        close();
    });

    // apply some form data to cached data list to view in real-time name & order changes
    React.useEffect(() => {
        if (box && (watchName !== box.name || watchOrder !== box.order)) {
            queryClient.setQueryData(getStorageGetBoxesQueryKey(), (data: storageGetBoxesResponse200) => {
                return {
                    ...data,
                    data: data?.data.map(b => {
                        if (b.id !== boxId) {
                            return b;
                        }

                        return {
                            ...b,
                            name: watchName,
                            order: watchOrder,
                        };
                    }),
                };
            });
        }
    }, [ box, boxId, queryClient, watchName, watchOrder ]);

    // reset list removing temp form data
    React.useEffect(() => {
        return () => {
            queryClient.invalidateQueries({
                queryKey: getStorageGetBoxesQueryKey(),
            });
        };
    }, [ queryClient ]);

    return (
        <form
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
            onSubmit={onSubmit}
        >
            <TextInput
                {...register('boxName', {
                    setValueAs: value => value.trim(),
                    minLength: 2,
                    maxLength: 64,
                })}
            />

            <SelectNumberInput
                {...register('type')}
                label={t('storage.box.edit.type')}
                data={
                    Object.entries(BoxType).map(([ key, value ]) => ({
                        value,
                        option: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    paddingLeft: 4,
                                }}
                            >
                                <BoxTypeIcon boxType={value} />
                                {t(`storage.box.edit.type.${key.toLowerCase() as Lowercase<keyof typeof BoxType>}`)}
                            </div>
                        ),
                        disabled: value === watchType,
                    })) ?? []
                }
                value={watchType}
                onChange={value => setValue('type', value as BoxType)}
            />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                {t('storage.box.edit.slotCount')}
                <NumberInput
                    {...register('slotCount', {
                        valueAsNumber: true,
                        min: minSlotCount,
                        max: 300,
                    })}
                    title={`${minSlotCount} - ${300}`}
                    style={{
                        width: 40,
                        textAlign: 'center',
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Button onClick={() => previousBox && setValue('order', previousBox.order - 5)} disabled={!previousBox}>
                    <Icon name='angle-left' solid forButton />
                </Button>
                {t('storage.bank.edit.order')}
                <Button onClick={() => nextBox && setValue('order', nextBox.order + 5)} disabled={!nextBox}>
                    <Icon name='angle-right' solid forButton />
                </Button>
            </div>

            <SelectStringInput
                {...register('bankId')}
                label={t('storage.box.edit.bank')}
                data={
                    banksQuery.data?.data.map(bank => ({
                        value: bank.id,
                        option: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    paddingLeft: 4,
                                }}
                            >
                                <Icon name='bank' solid forButton />
                                {bank.name}
                            </div>
                        ),
                        disabled: bank.id === watchBankId,
                    })) ?? []
                }
                value={watchBankId}
                onChange={value => setValue('bankId', value)}
                disabled={boxes.length <= 1}
            />

            <Button type='submit' big bgColor={theme.bg.primary} disabled={watchName.length === 0 || !formState.isValid}>
                <Icon name='pen' forButton />
                {t('action.submit')}
            </Button>
        </form>
    );
};
