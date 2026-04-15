import { css } from '@emotion/css';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { BoxDTO, GameVersion, StorageSortPkmsParams } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes, useStorageSortPkms } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { CheckboxInput } from '../../ui/input/checkbox-input';
import { SelectNumberInput, SelectStringInput } from '../../ui/input/select-input';
import { theme } from '../../ui/theme';
import { BoxTypeIcon } from '../box/box-type-icon';

export const SortAdvancedAction = {
    Main: ({ selectedBoxId, close }: { selectedBoxId: number; close: () => void }) => {
        const boxesQuery = useStorageGetBoxes();

        const pkmVariantsQuery = usePkmVariantIndex();
        const pkmVersions = [ ...new Set(Object.values(pkmVariantsQuery.data?.data.byId ?? {}).map(pkm => pkm.contextVersion)) ];

        return <InnerSortAdvancedAction
            selectedBoxId={selectedBoxId}
            close={close}
            boxes={boxesQuery.data?.data ?? []}
            versions={pkmVersions}
        />;
    },
    Save: ({ saveId, selectedBoxId, close }: { saveId: number; selectedBoxId: number; close: () => void }) => {
        const boxesQuery = useStorageGetBoxes({ saveId });

        const save = useSaveInfosGetAll().data?.data[ saveId ];

        return <InnerSortAdvancedAction
            saveId={saveId}
            selectedBoxId={selectedBoxId}
            close={close}
            boxes={boxesQuery.data?.data ?? []}
            versions={save ? [ save.version ] : []}
        />;
    },
};

// eslint-disable-next-line react-refresh/only-export-components
const InnerSortAdvancedAction: React.FC<{
    saveId?: number;
    selectedBoxId: number;
    close: () => void;
    boxes: BoxDTO[];
    versions: GameVersion[];
}> = ({ saveId, selectedBoxId, close, boxes, versions }) => {
    const { t } = useTranslate();

    const bankId = boxes.find(box => box.idInt === selectedBoxId)?.bankId;

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
            fromBoxId: selectedBoxId,
            toBoxId: selectedBoxId,
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
                saveId,
                fromBoxId,
                toBoxId,
                pokedexName,
                leaveEmptySlot,
            },
        });

        if (result.status >= 400) {
            return;
        }

        close();
    });

    return (
        <form
            onSubmit={onSubmit}
            className={css({
                maxWidth: 350,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            })}
        >
            <SelectStringInput
                {...register('pokedexName')}
                label={t('storage.sort.pokedex')}
                data={
                    pokedexKeys.map(key => ({
                        value: key,
                        option: staticData.pokedexes[ key ]!.name,
                        disabled: key === pokedexName,
                    })) ?? []
                }
                value={pokedexName}
                onChange={value => setValue('pokedexName', value)}
                disabled={pokedexKeys.length === 1}
            />

            <SelectNumberInput
                {...register('fromBoxId', { valueAsNumber: true })}
                label={t('storage.sort.from-box')}
                data={
                    filteredBoxes.map(box => ({
                        value: box.idInt,
                        option: (
                            <div
                                className={css({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    paddingLeft: 4,
                                })}
                            >
                                <BoxTypeIcon boxType={box.type} />
                                {box.name}
                            </div>
                        ),
                        disabled: box.idInt === fromBoxId,
                    })) ?? []
                }
                value={fromBoxId}
                onChange={value => setValue('fromBoxId', value)}
            />

            <SelectNumberInput
                {...register('toBoxId', { valueAsNumber: true })}
                label={t('storage.sort.to-box')}
                data={
                    filteredBoxes.map(box => ({
                        value: box.idInt,
                        option: (
                            <div
                                className={css({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    paddingLeft: 4,
                                })}
                            >
                                <BoxTypeIcon boxType={box.type} />
                                {box.name}
                            </div>
                        ),
                        disabled: box.idInt === toBoxId,
                    })) ?? []
                }
                value={toBoxId}
                onChange={value => setValue('toBoxId', value)}
            />

            <label
                className={css({
                    display: 'flex',
                    gap: 4,
                    cursor: 'pointer',
                    userSelect: 'none',
                })}
            >
                <CheckboxInput checked={leaveEmptySlot} onChange={() => setValue('leaveEmptySlot', !leaveEmptySlot)} />{' '}
                {t('storage.sort.empty-slot')}
            </label>

            <div>
                {t('storage.sort.description.1')}
                <br />
                {saveId ? t('storage.sort.description.2') : t('storage.sort.description.3')}
            </div>

            <Button
                type='submit'
                big
                bgColor={theme.bg.primary}
                loading={formState.isSubmitting}
                disabled={!formState.isValid}
            >
                <Icon name='sort' solid forButton />
                {t('action.submit')}
            </Button>
        </form>
    );
};
