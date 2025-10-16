import type React from 'react';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageEvolvePkm, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainCreatePkmVersion, useStorageMainPkmDetachSave, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { getSaveOrder } from '../../storage/util/get-save-order';
import { useTranslate } from '../../translate/i18n';
import { filterIsDefined } from '../../util/filter-is-defined';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { Icon } from '../icon/icon';
import { StorageDetailsForm } from '../storage-item-details/storage-details-form';
import { theme } from '../theme';
import { StorageItemMainActionsContainer } from './storage-item-main-actions-container';

export const StorageItemMainActions: React.FC = () => {
    const { t } = useTranslate();

    const navigate = Route.useNavigate();
    const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};
    const selected = Route.useSearch({ select: (search) => search.selected });

    const formEditMode = StorageDetailsForm.useEditMode();

    const moveClickable = StorageMoveContext.useClickable(selected?.id ?? '', undefined);

    const saveInfosQuery = useSaveInfosGetAll();
    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionQuery = useStorageGetMainPkmVersions();

    const mainCreatePkmVersionMutation = useStorageMainCreatePkmVersion();
    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    const savePkmSynchronizeMutation = useStorageSaveSynchronizePkm();
    const evolvePkmMutation = useStorageEvolvePkm();

    const selectedPkm = mainPkmQuery.data?.data.find(pkm => pkm.id === selected?.id);
    const pkmSavePkmQuery = useStorageGetSavePkms(selectedPkm?.saveId ?? 0);
    if (!selectedPkm) {
        return null;
    }

    const pkmVersions = mainPkmVersionQuery.data?.data.filter(version => version.pkmId === selectedPkm.id) ?? [];
    if (pkmVersions.length === 0) {
        return null;
    }
    const pkmVersionsIds = pkmVersions.map(version => version.id);

    const { compatibleWithVersions } = pkmVersions[ 0 ];

    const pageSaves = Object.values(saves).map(save => save && saveInfosQuery.data?.data?.[ save.saveId ]).filter(filterIsDefined);

    const attachedSavePkm = selectedPkm.saveId ? pkmSavePkmQuery.data?.data.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = attachedSavePkm && pkmVersions.find(version => version.id === attachedSavePkm.pkmVersionId);
    const saveSynchronized = attachedSavePkm?.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const pkmVersionCanEvolve = pkmVersions.find(version => version.canEvolve);

    const canCreateVersions = selectedPkm.saveId
        ? []
        : [ ... new Set(pageSaves
            .filter(pageSave => {
                const hasPkmForPageSaveGeneration = pkmVersions.some(pkmVersion => pkmVersion.generation === pageSave.generation);
                const isCompatibleWithPageSave = compatibleWithVersions.includes(pageSave.version);

                return isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
            })
            .map(pageSave => pageSave.generation)) ].sort();

    const canEvolve = pkmVersionCanEvolve && !selectedPkm.saveId;
    const canDetach = !!selectedPkm.saveId;
    const canGoToSave = !!selectedPkm.saveId;
    const canSynchronize = !!selectedPkm.saveId && !!attachedPkmVersion && !saveSynchronized;

    return <StorageItemMainActionsContainer pkmId={selectedPkm.id}>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxWidth: 170,
            }}
        >
            {moveClickable.onClick && <Button
                onClick={moveClickable.onClick}
            >
                <Icon name='logout' solid forButton />
                {t('storage.actions.move')}
            </Button>}

            {moveClickable.onClickAttached && pageSaves.length > 0 && <ButtonWithDisabledPopover
                as={Button}
                onClick={moveClickable.onClickAttached}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.move-attached-main.helpTitle')}
                helpContent={t('storage.actions.move-attached-main.helpContent')}
            >
                <Icon name='link' solid forButton />
                <Icon name='logout' solid forButton />
                {t('storage.actions.move-attached-main')}
            </ButtonWithDisabledPopover>}

            {canCreateVersions.map(generation => <ButtonWithDisabledPopover
                key={generation}
                as={Button}
                bgColor={theme.bg.primary}
                onClick={() => mainCreatePkmVersionMutation.mutateAsync({
                    params: {
                        generation: generation,
                        pkmId: selectedPkm.id,
                    },
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.create-version.helpTitle', { generation: generation })}
                helpContent={t('storage.actions.create-version.helpContent')}
            >
                <Icon name='plus' solid forButton />
                {t('storage.actions.create-version', { generation: generation })}
            </ButtonWithDisabledPopover>)}

            {canGoToSave && <ButtonWithDisabledPopover
                as={Button}
                onClick={() => navigate({
                    search: ({ saves }) => ({
                        selected: attachedSavePkm && {
                            saveId: selectedPkm.saveId,
                            id: attachedSavePkm.id,
                        },
                        saves: selectedPkm.saveId ? {
                            ...saves,
                            [ selectedPkm.saveId ]: {
                                saveId: selectedPkm.saveId,
                                saveBoxId: attachedSavePkm?.box,
                                order: getSaveOrder(saves, selectedPkm.saveId),
                            }
                        } : saves,
                    })
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.go-main.helpTitle')}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.go-main')}
            </ButtonWithDisabledPopover>}

            {canSynchronize && <Button
                bgColor={theme.bg.primary}
                onClick={() => savePkmSynchronizeMutation.mutateAsync({
                    saveId: selectedPkm.saveId!,
                    params: {
                        pkmVersionId: attachedPkmVersion.id,
                    }
                })}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.synchro')}
            </Button>}

            <Button
                onClick={formEditMode.startEdit}
                disabled={formEditMode.editMode}
            >
                <Icon name='pen' solid forButton />
                {t('storage.actions.edit')}
            </Button>

            {canEvolve && <ButtonWithConfirm
                anchor='right'
                bgColor={theme.bg.primary}
                onClick={async () => {
                    const mutateResult = await evolvePkmMutation.mutateAsync({
                        id: pkmVersionCanEvolve.id,
                        params: {},
                    });
                    const newId = mutateResult.data.mainPkms
                        ?.find(pkm => pkm.boxId === selectedPkm.boxId && pkm.boxSlot === selectedPkm.boxSlot)?.id;
                    if (newId) {
                        navigate({
                            search: {
                                selected: {
                                    id: newId,
                                    saveId: undefined,
                                }
                            }
                        });
                    }
                }}
            >
                <Icon name='sparkles' solid forButton />
                {t('storage.actions.evolve')}
            </ButtonWithConfirm>}

            {canDetach && <ButtonWithDisabledPopover
                as={ButtonWithConfirm}
                onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                    pkmId: selectedPkm.id,
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.detach-main.helpTitle')}
                helpContent={t('storage.actions.detach-main.helpContent')}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.detach-main')}
            </ButtonWithDisabledPopover>}
        </div>
    </StorageItemMainActionsContainer>;
};
