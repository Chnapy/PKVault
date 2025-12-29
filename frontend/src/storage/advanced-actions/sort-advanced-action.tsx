import type React from 'react';
import { useForm } from 'react-hook-form';
import type { StorageSortPkmsParams } from '../../data/sdk/model';
import { useStorageGetMainBoxes, useStorageSortPkms } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { CheckboxInput } from '../../ui/input/checkbox-input';
import { SelectNumberInput } from '../../ui/input/select-input';
import { theme } from '../../ui/theme';
import { BoxTypeIcon } from '../box/box-type-icon';

export const SortAdvancedAction: React.FC<{
    selectedBoxId: number;
    close: () => void;
}> = ({ selectedBoxId, close }) => {
    const { t } = useTranslate();

    const boxesQuery = useStorageGetMainBoxes();
    const bankId = boxesQuery.data?.data.find(box => box.idInt === selectedBoxId)?.bankId;
    const boxes = boxesQuery.data?.data
        .filter(box => box.bankId === bankId)
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
        await sortPkmsMutation.mutateAsync({
            params: {
                fromBoxId,
                toBoxId,
                leaveEmptySlot,
            }
        });
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
            label={'From box'}
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
            label={'To box'}
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
            /> Leave empty slot
        </label>

        <div>
            Pkms in box range will be sorted by species, starting from Bulbasaur (#1).
            <br />If you leave empty slot for missing species, boxes may be created in the process (if missing space only).
        </div>

        <Button type='submit' big bgColor={theme.bg.primary} disabled={!formState.isValid}>
            <Icon name='sort' solid forButton />
            {t('action.submit')}
        </Button>
    </form>;
};
