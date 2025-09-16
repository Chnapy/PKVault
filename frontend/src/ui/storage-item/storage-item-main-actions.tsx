import type React from 'react';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStorageEvolvePkm, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainCreatePkmVersion, useStorageMainPkmDetachSave, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { Icon } from '../icon/icon';
import { StorageDetailsForm } from '../storage-item-details/storage-details-form';
import { theme } from '../theme';
import { StorageItemMainActionsContainer } from './storage-item-main-actions-container';

export const StorageItemMainActions: React.FC = () => {
    const navigate = Route.useNavigate();
    const saveId = Route.useSearch({ select: (search) => search.save });
    const selected = Route.useSearch({ select: (search) => search.selected });

    const formEditMode = StorageDetailsForm.useEditMode();

    const moveClickable = StorageMoveContext.useClickable(selected?.id ?? '', 'main');

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

    const pageSave = saveId ? saveInfosQuery.data?.data[ saveId ] : undefined;
    const attachedSavePkm = selectedPkm.saveId ? pkmSavePkmQuery.data?.data.find(savePkm => savePkm.pkmVersionId && pkmVersionsIds.includes(savePkm.pkmVersionId)) : undefined;
    const attachedPkmVersion = attachedSavePkm && pkmVersions.find(version => version.id === attachedSavePkm.pkmVersionId);
    const saveSynchronized = attachedSavePkm?.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const hasPkmForPageSaveGeneration = !!pageSave && pkmVersions.some(pkmVersion => pkmVersion.generation === pageSave.generation);
    const isCompatibleWithPageSave = !pageSave || compatibleWithVersions.includes(pageSave.version);
    const pkmVersionCanEvolve = pkmVersions.find(version => version.canEvolve);

    const canCreateVersion = !selectedPkm.saveId && !!pageSave && isCompatibleWithPageSave && !hasPkmForPageSaveGeneration;
    const canMoveAttached = !selectedPkm.saveId && hasPkmForPageSaveGeneration;
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
            }}
        >
            <Button
                onClick={moveClickable.onClick}
            >
                <Icon name='logout' solid forButton />
                Move
            </Button>

            {canMoveAttached && <Button>
                <Icon name='link' solid forButton />
                <Icon name='logout' solid forButton />
                Move attached
            </Button>}

            {canCreateVersion && <Button
                bgColor={theme.bg.primary}
                onClick={() => mainCreatePkmVersionMutation.mutateAsync({
                    params: {
                        generation: pageSave.generation,
                        pkmId: selectedPkm.id,
                    },
                })}
            >
                <Icon name='plus' solid forButton />
                Create version for gen.{pageSave?.generation}
            </Button>}

            {canGoToSave && <Button
                onClick={() => navigate({
                    search: {
                        save: selectedPkm.saveId,
                        saveBoxId: attachedSavePkm?.box.toString(),
                        selected: attachedSavePkm && {
                            type: 'save',
                            id: attachedSavePkm.id,
                        },
                    }
                })}
            >
                <Icon name='link' solid forButton />
                Go to attached save
            </Button>}

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
                Synchronize
            </Button>}

            <Button
                onClick={formEditMode.startEdit}
                disabled={formEditMode.editMode}
            >
                <Icon name='pen' solid forButton />
                Edit
            </Button>

            {canEvolve && <ButtonWithConfirm
                anchor='right'
                bgColor={theme.bg.primary}
                onClick={() => evolvePkmMutation.mutateAsync({
                    id: pkmVersionCanEvolve.id,
                    params: {},
                })}
            >
                <Icon name='sparkles' solid forButton />
                Evolve
            </ButtonWithConfirm>}

            {canDetach && <ButtonWithConfirm
                anchor='right'
                onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                    pkmId: selectedPkm.id,
                })}
            >
                <Icon name='link' solid forButton />
                Detach from save
            </ButtonWithConfirm>}
        </div>
    </StorageItemMainActionsContainer>;
};
