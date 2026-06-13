import { Box, Stack, type ComboboxItem } from '@mantine/core';
import { SortDescIcon } from 'lucide-react';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { StorageSortPkmsParams } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes, useStorageSortPkms } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui-new/form/button/ui-button';
import { UISelect } from '../../ui-new/form/select/ui-select';
import { UISwitch } from '../../ui-new/form/switch/ui-switch';
import { usePopover } from '../../ui-new/interaction/focus-controls/components/popover/hooks/use-popover';

export const SortAdvancedAction: React.FC<{
    saveId: number | null;
    boxId: number;
}> = ({ saveId, boxId }) => {
    const { t } = useTranslate();

    const popover = usePopover();

    const saveInfos = useSaveInfosGetAll();
    const save = saveId ? saveInfos.data?.data[ saveId ] : undefined;

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });
    const boxes = boxesQuery.data?.data ?? [];

    const versionsQuery = usePkmVariantIndex(data => {
        if (save)
            return [ save.version ];

        return [ ...new Set(Object.values(data.data.byId)
            .map(pkm => pkm.contextVersion)
        ) ];
    });

    const versions = versionsQuery.data ?? [];

    const bankId = boxes.find(box => box.idInt === boxId)?.bankId;

    const filteredBoxes = boxes
        .filter(box => box.bankId === bankId)
        .filter(box => !saveId || box.canSaveReceivePkm)
        .sort((box1, box2) => (box1.order < box2.order ? -1 : 1)) ?? [];

    const staticData = useStaticData();

    const pokedexKeys = [ ...new Set(
        versions.flatMap(version => staticData.versions[ version ]?.pokedexes ?? [])
    ) ]
        .sort((key1, key2) => staticData.pokedexes[ key1 ]!.order - staticData.pokedexes[ key2 ]!.order);

    const sortPkmsMutation = useStorageSortPkms();

    const { register, handleSubmit, formState, setValue, control } = useForm<Omit<StorageSortPkmsParams, 'saveId'>>({
        defaultValues: {
            fromBoxId: boxId,
            toBoxId: boxId,
            pokedexName: pokedexKeys[ 0 ],
            leaveEmptySlot: false,
        },
    });

    const [ pokedexName, fromBoxId, toBoxId, leaveEmptySlot ] = useWatch({ control, name: [ 'pokedexName', 'fromBoxId', 'toBoxId', 'leaveEmptySlot' ] });

    if (!boxes.length || !versions.length) {
        return null;
    }

    const onSubmit = handleSubmit(async ({ fromBoxId, toBoxId, pokedexName, leaveEmptySlot }) => {
        const result = await sortPkmsMutation.mutateAsync({
            params: {
                saveId: saveId ?? undefined,
                fromBoxId,
                toBoxId,
                pokedexName,
                leaveEmptySlot,
            },
        });

        if (result.status >= 400) {
            return;
        }

        popover?.setOpened(false);
    });

    return (
        <Stack
            component='form'
            onSubmit={onSubmit}
            maw={350}
        >
            <UISelect
                {...register('pokedexName')}
                controlLabel='Pokedex name'
                label={t('storage.sort.pokedex')}
                data={
                    pokedexKeys.map((key): ComboboxItem => ({
                        value: key,
                        label: staticData.pokedexes[ key ]!.name,
                        disabled: key === pokedexName,
                    })) ?? []
                }
                // value={pokedexName}
                // onChange={value => setValue('pokedexName', value)}
                disabled={pokedexKeys.length === 1}
            />

            <UISelect
                {...register('fromBoxId')}
                controlLabel='From box'
                label={t('storage.sort.from-box')}
                data={
                    filteredBoxes.map((box): ComboboxItem => ({
                        value: box.id,
                        label: box.name,
                        disabled: box.idInt === fromBoxId,
                    })) ?? []
                }
                value={fromBoxId.toString()}
                onChange={e => setValue('fromBoxId', +e.currentTarget.value)}
            />

            <UISelect
                {...register('toBoxId')}
                controlLabel='To box'
                label={t('storage.sort.to-box')}
                data={
                    filteredBoxes.map((box): ComboboxItem => ({
                        value: box.id,
                        label: box.name,
                        disabled: box.idInt === toBoxId,
                    })) ?? []
                }
                value={toBoxId.toString()}
                onChange={e => setValue('toBoxId', +e.currentTarget.value)}
            />

            <UISwitch
                name='leaveEmptySlot'
                controlLabel='Leave empty slots'
                label={t('storage.sort.empty-slot')}
                checked={leaveEmptySlot}
                onChange={() => setValue('leaveEmptySlot', !leaveEmptySlot)}
            />

            <Box>
                {t('storage.sort.description.1')}
                <br />
                {saveId ? t('storage.sort.description.2') : t('storage.sort.description.3')}
            </Box>

            <UIButton
                name='submit'
                controlLabel='Submit'
                type='submit'
                color='blue'
                loading={formState.isSubmitting}
                disabled={!formState.isValid}
                leftSection={<SortDescIcon />}
            >
                {t('action.submit')}
            </UIButton>
        </Stack>
    );
};
