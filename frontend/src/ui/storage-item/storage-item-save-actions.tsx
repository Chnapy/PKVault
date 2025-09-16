import type React from 'react';
import { useStorageEvolvePkm, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainPkmDetachSave, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { Icon } from '../icon/icon';
import { StorageDetailsForm } from '../storage-item-details/storage-details-form';
import { theme } from '../theme';
import { StorageItemSaveActionsContainer } from './storage-item-save-actions-container';

export const StorageItemSaveActions: React.FC = () => {
    const navigate = Route.useNavigate();
    const saveId = Route.useSearch({ select: (search) => search.save });
    const selected = Route.useSearch({ select: (search) => search.selected });

    const formEditMode = StorageDetailsForm.useEditMode();

    const moveClickable = StorageMoveContext.useClickable(selected?.id ?? '', 'save');

    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionQuery = useStorageGetMainPkmVersions();
    const pkmSavePkmQuery = useStorageGetSavePkms(saveId ?? 0);

    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    const savePkmSynchronizeMutation = useStorageSaveSynchronizePkm();
    const evolvePkmMutation = useStorageEvolvePkm();

    const selectedPkm = pkmSavePkmQuery.data?.data.find(pkm => pkm.id === selected?.id);
    if (!selectedPkm) {
        return null;
    }

    const attachedPkmVersion = selectedPkm.pkmVersionId ? mainPkmVersionQuery.data?.data.find(version => version.id === selectedPkm.pkmVersionId) : undefined;
    const attachedPkm = attachedPkmVersion && mainPkmQuery.data?.data.find(pkm => pkm.id === attachedPkmVersion.pkmId);

    const saveSynchronized = selectedPkm.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    const canMoveAttached = !selectedPkm.pkmVersionId;
    const canEvolve = selectedPkm.canEvolve && !selectedPkm.pkmVersionId;
    const canDetach = !!selectedPkm.pkmVersionId;
    const canGoToMain = !!selectedPkm.pkmVersionId;
    const canSynchronize = !!selectedPkm.pkmVersionId && !!attachedPkmVersion && !saveSynchronized;

    return <StorageItemSaveActionsContainer pkmId={selectedPkm.id}>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}
        >
            <Button onClick={moveClickable.onClick}>
                <Icon name='logout' solid forButton />
                Move
            </Button>

            {canMoveAttached && <Button>
                <Icon name='link' solid forButton />
                <Icon name='logout' solid forButton />
                Move attached
            </Button>}

            {canGoToMain && attachedPkmVersion && <Button
                onClick={() => navigate({
                    search: {
                        save: selectedPkm.saveId,
                        saveBoxId: selectedPkm.box.toString(),
                        mainBoxId: attachedPkm?.boxId,
                        selected: {
                            type: 'main',
                            id: attachedPkmVersion.pkmId,
                        },
                    }
                })}
            >
                <Icon name='link' solid forButton />
                Go to attached pkm
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
                    id: selectedPkm.id,
                    params: {
                        saveId: selectedPkm.saveId,
                    },
                })}
            >
                <Icon name='sparkles' solid forButton />
                Evolve
            </ButtonWithConfirm>}

            {canDetach && attachedPkmVersion && <ButtonWithConfirm
                anchor='right'
                onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                    pkmId: attachedPkmVersion.pkmId,
                })}
            >
                <Icon name='link' solid forButton />
                Detach from pkm
            </ButtonWithConfirm>}
        </div>
    </StorageItemSaveActionsContainer>;
};
