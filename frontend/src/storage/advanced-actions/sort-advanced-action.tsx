import { SortDescIcon } from 'lucide-react';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { StorageSortPkmsParams } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageSortPkms } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { UISelect } from '../../ui/form/select/ui-select';
import { UISwitch } from '../../ui/form/switch/ui-switch';
import { usePopover } from '../../ui/interaction/focus-controls/components/popover/hooks/use-popover';
import { UIFormCard } from '../../ui/popover/popover-card/ui-form-card';
import { useFilteredBoxes } from '../panel/hooks/use-filtered-boxes';

export const SortAdvancedAction: React.FC<{
    saveId: number | null;
    boxId: number;
}> = ({ saveId, boxId }) => {
    const { t } = useTranslate();

    const popover = usePopover();

    const saveInfos = useSaveInfosGetAll();
    const save = saveId ? saveInfos.data?.data[ saveId ] : undefined;

    const boxesQuery = useFilteredBoxes(saveId);
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

    const { handleSubmit, formState, setValue, control } = useForm<Omit<StorageSortPkmsParams, 'saveId'>>({
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

    return <UIFormCard
        onSubmit={onSubmit}
        icon={<SortDescIcon />}
        title={t('storage.box.advanced.sort')}
        description={t('storage.sort.description.1')}
        disabled={!formState.isValid}
        miw={350}
    >
        <UISelect
            name='pokedexName'
            controlLabel={t('storage.sort.pokedex')}
            label={t('storage.sort.pokedex')}
            data={pokedexKeys.map((key) => ({
                value: key,
                label: staticData.pokedexes[ key ]!.name,
                disabled: key === pokedexName,
            }))}
            value={pokedexName}
            onChange={value => value && setValue('pokedexName', value)}
            disabled={pokedexKeys.length === 1}
            comboboxProps={{ withinPortal: false }}
        />

        <UISelect
            name='fromBoxId'
            controlLabel={t('storage.sort.from-box')}
            label={t('storage.sort.from-box')}
            data={filteredBoxes.map((box) => ({
                value: box.idInt,
                label: box.name,
                disabled: box.idInt === fromBoxId,
            }))}
            value={fromBoxId}
            onChange={value => value !== null && setValue('fromBoxId', value)}
            comboboxProps={{ withinPortal: false }}
        />

        <UISelect
            name='toBoxId'
            controlLabel={t('storage.sort.to-box')}
            label={t('storage.sort.to-box')}
            data={filteredBoxes.map((box) => ({
                value: box.idInt,
                label: box.name,
                disabled: box.idInt === toBoxId,
            }))}
            value={toBoxId}
            onChange={value => value !== null && setValue('toBoxId', value)}
            comboboxProps={{ withinPortal: false }}
        />

        <UISwitch
            name='leaveEmptySlot'
            controlLabel={t('storage.sort.empty-slot')}
            label={t('storage.sort.empty-slot')}
            description={saveId ? t('storage.sort.description.2') : t('storage.sort.description.3')}
            checked={leaveEmptySlot}
            onChange={() => setValue('leaveEmptySlot', !leaveEmptySlot)}
        />

    </UIFormCard>;
};
