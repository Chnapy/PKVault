import type { UseQueryResult } from '@tanstack/react-query';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { StorageSortPkmsParams } from '../../data/sdk/model';
import { useStorageGetMainBoxes, useStorageGetSaveBoxes, useStorageSortPkms, type storageGetMainBoxesResponse200, type storageGetSaveBoxesResponse200 } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { CheckboxInput } from '../../ui/input/checkbox-input';
import { SelectNumberInput } from '../../ui/input/select-input';
import { theme } from '../../ui/theme';
import { BoxTypeIcon } from '../box/box-type-icon';

export const SortAdvancedAction = {
    Main: ({ selectedBoxId, close }: {
        selectedBoxId: number;
        close: () => void;
    }) => {
        const boxesQuery = useStorageGetMainBoxes();

        return <InnerSortAdvancedAction
            selectedBoxId={selectedBoxId}
            close={close}
            boxesQuery={boxesQuery}
        />;
    },
    Save: ({ saveId, selectedBoxId, close }: {
        saveId: number;
        selectedBoxId: number;
        close: () => void;
    }) => {
        const boxesQuery = useStorageGetSaveBoxes(saveId);

        return <InnerSortAdvancedAction
            saveId={saveId}
            selectedBoxId={selectedBoxId}
            close={close}
            boxesQuery={boxesQuery}
        />;
    },
};

// eslint-disable-next-line react-refresh/only-export-components
const InnerSortAdvancedAction: React.FC<{
    saveId?: number;
    selectedBoxId: number;
    close: () => void;
    boxesQuery: UseQueryResult<storageGetSaveBoxesResponse200 | storageGetMainBoxesResponse200, unknown>;
}> = ({ saveId, selectedBoxId, close, boxesQuery }) => {
    const { t } = useTranslate();

    const bankId = boxesQuery.data?.data.find(box => box.idInt === selectedBoxId)?.bankId;
    const boxes = boxesQuery.data?.data
        .filter(box => box.bankId === bankId)
        .filter(box => !saveId || box.canSaveReceivePkm)
        .sort((box1, box2) => box1.order < box2.order ? -1 : 1) ?? [];

    const sortPkmsMutation = useStorageSortPkms();

    const { register, handleSubmit, formState, watch, getValues, setValue } = useForm<Omit<StorageSortPkmsParams, 'saveId'>>({
        defaultValues: {
            fromBoxId: selectedBoxId,
            toBoxId: selectedBoxId,
            leaveEmptySlot: false,
        }
    });

    const onSubmit = handleSubmit(async ({ fromBoxId, toBoxId, leaveEmptySlot }) => {
        const result = await sortPkmsMutation.mutateAsync({
            params: {
                saveId,
                fromBoxId,
                toBoxId,
                leaveEmptySlot,
            }
        });

        if (result.status >= 400) {
            return;
        }

        close();
    });

    return <form
        onSubmit={onSubmit}
        style={{
            maxWidth: 350,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}
    >
        <SelectNumberInput
            {...register('fromBoxId', { valueAsNumber: true })}
            label={t('storage.sort.from-box')}
            data={boxes.map(box => ({
                value: box.idInt,
                option: <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    paddingLeft: 4,
                }}>
                    <BoxTypeIcon boxType={box.type} />
                    {box.name}
                </div>,
                disabled: box.idInt === watch('fromBoxId')
            })) ?? []}
            value={watch('fromBoxId')}
            onChange={value => setValue('fromBoxId', value)}
        />

        <SelectNumberInput
            {...register('toBoxId', { valueAsNumber: true })}
            label={t('storage.sort.to-box')}
            data={boxes.map(box => ({
                value: box.idInt,
                option: <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    paddingLeft: 4,
                }}>
                    <BoxTypeIcon boxType={box.type} />
                    {box.name}
                </div>,
                disabled: box.idInt === watch('toBoxId')
            })) ?? []}
            value={watch('toBoxId')}
            onChange={value => setValue('toBoxId', value)}
        />

        <label
            style={{
                display: 'flex',
                gap: 4,
                cursor: 'pointer',
                userSelect: 'none',
            }}
        >
            <CheckboxInput
                checked={watch('leaveEmptySlot')}
                onChange={() => setValue('leaveEmptySlot', !getValues('leaveEmptySlot'))}
            /> {t('storage.sort.empty-slot')}
        </label>

        <div>
            {t('storage.sort.description.1')}
            <br />
            {saveId
                ? t('storage.sort.description.2')
                : t('storage.sort.description.3')}
        </div>

        <Button type='submit' big bgColor={theme.bg.primary} disabled={!formState.isValid}>
            <Icon name='sort' solid forButton />
            {t('action.submit')}
        </Button>
    </form>;
};
