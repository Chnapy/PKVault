import { Group } from '@mantine/core';
import type React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { PkmVariantDTO } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui/form/button/ui-button';
import { UIPokedexIcons } from '../../ui/pokedex/icons/ui-pokedex-icons';
import { UIGameImg } from '../../ui/sprite-img/ui-game-img';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';
import { useCurrentStorage, useOtherStorage } from '../panel/storage-panel-context';

export const DetailsAttachedButton: React.FC = () => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const navigate = Route.useNavigate();

    const { getSelected } = useCurrentStorage();
    const otherStorage = useOtherStorage();

    const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId });
    const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id });

    const pkmIndexQuery = usePkmIndex(selectedSaveId ?? null, data => data.data.byId[ selectedId ?? '' ]);

    const pkm = pkmIndexQuery.data;

    const pkmVariantAttachedSaveId = (pkm as PkmVariantDTO | undefined)?.attachedSaveId;
    const pkmVariantAttachedSavePkmIdBase = (pkm as PkmVariantDTO | undefined)?.attachedSavePkmIdBase;

    const saveInfosQuery = useSaveInfosGetAll({ query: { enabled: !!selectedSaveId } });

    const attachedVariantPkmQuery = usePkmVariantIndex(
        useSelectCallback(data => {
            if (!pkm || !selectedSaveId)
                return;

            const variantPkm = data.data.byAttachedSave[ selectedSaveId ]?.[ pkm.idBase ];
            return variantPkm && pick(variantPkm, [ 'id', 'boxId' ]);
        }, [ pkm, selectedSaveId ])
    );

    const attachedSavePkmQuery = usePkmSaveIndex(
        pkmVariantAttachedSaveId ?? 0,
        useSelectCallback(data => {
            if (!pkmVariantAttachedSavePkmIdBase)
                return;

            const savePkm = data.data.byIdBase[ pkmVariantAttachedSavePkmIdBase ]?.[ 0 ];
            return savePkm && pick(savePkm, [ 'id', 'saveId', 'boxId' ]);
        }, [ pkmVariantAttachedSavePkmIdBase ])
    );

    if (!pkm)
        return null;

    const attachedLoading = [ saveInfosQuery, attachedVariantPkmQuery, attachedSavePkmQuery ].some(q => q.isPending && q.isEnabled);
    const hasAttached = !!pkmVariantAttachedSaveId || attachedLoading || !!attachedVariantPkmQuery.data;

    if (!hasAttached)
        return null;

    const attachedSave = pkmVariantAttachedSaveId ? saveInfosQuery.data?.data[ pkmVariantAttachedSaveId ] : undefined;
    const attachedStorageName = attachedSave
        ? <>{staticData.versions[ attachedSave.displayedVersion ]?.name} ({attachedSave.trainerName})</>
        : 'PKVault';

    const onClick = () => {
        navigate({
            search: search => {
                if (attachedSavePkmQuery.data) {
                    return {
                        ...search,
                        storages: otherStorage.setStorage(search.storages, {
                            saveId: attachedSavePkmQuery.data.saveId,
                            boxId: attachedSavePkmQuery.data.boxId,
                        }),
                        selected: {
                            saveId: attachedSavePkmQuery.data.saveId,
                            id: attachedSavePkmQuery.data.id,
                            storage: otherStorage.storageIndex,
                        },
                    };
                }

                if (attachedVariantPkmQuery.data) {
                    return {
                        ...search,
                        storages: otherStorage.setStorage(search.storages, {
                            saveId: null,
                            boxId: attachedVariantPkmQuery.data.boxId,
                        }),
                        selected: {
                            saveId: undefined,
                            id: attachedVariantPkmQuery.data.id,
                            storage: otherStorage.storageIndex,
                        },
                    };
                }

                return search;
            },
        });
    };

    return <UIButton
        name='attached'
        controlLabel={t('storage.actions.go-attached')}
        loading={attachedLoading}
        onClick={onClick}
        leftSection={
            <Group wrap='nowrap' gap='sm'>
                <UIPokedexIcons.Attached size='xs' />
                <UIGameImg version={attachedSave?.displayedVersion ?? null} size={20} />
            </Group>
        }
        size='compact-sm'
        mt='auto'
    >
        {attachedStorageName}
    </UIButton>;
};
