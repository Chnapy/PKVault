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
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';

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
            {moveClickable.onClick && <Button onClick={moveClickable.onClick}>
                <Icon name='logout' solid forButton />
                Move
            </Button>}

            {moveClickable.onClickAttached && <ButtonWithDisabledPopover
                onClick={moveClickable.onClickAttached}
                showHelp
                anchor='right start'
                helpTitle='Move a linked copy of this pkm to the storage'
                helpContent={
                    'Move a copy to storage, attached to save pkm.'
                    + '\nAn attached pkm synchronizes its data from save with stored pkm: exp, level, EVs, moves, nickname.'
                    + '\nThis allows to use the same pkm later in another save even if it\'s not the same generation'
                }
            >
                <Icon name='link' solid forButton />
                <Icon name='logout' solid forButton />
                Move attached
            </ButtonWithDisabledPopover>}

            {canGoToMain && attachedPkmVersion && <ButtonWithDisabledPopover
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
                showHelp
                anchor='right start'
                helpTitle='An attached pkm is present in storage'
            >
                <Icon name='link' solid forButton />
                Go to attached pkm
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

            {canDetach && attachedPkmVersion && <ButtonWithDisabledPopover
                onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                    pkmId: attachedPkmVersion.pkmId,
                })}
                showHelp
                anchor='right start'
                helpTitle='Detach save pkm from attached one in storage'
                helpContent={
                    'Break link between this pkm and the one in storage.'
                    + '\nAllows to use pkm in another save, and create new versions.'
                }
            >
                <Icon name='link' solid forButton />
                Detach from pkm
            </ButtonWithDisabledPopover>}
        </div>
    </StorageItemSaveActionsContainer>;
};
