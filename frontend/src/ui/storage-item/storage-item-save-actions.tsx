import type React from 'react';
import { useStorageEvolvePkm, useStorageGetMainPkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainPkmDetachSave, useStorageSaveSynchronizePkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { Icon } from '../icon/icon';
import { StorageDetailsForm } from '../storage-item-details/storage-details-form';
import { theme } from '../theme';
import { StorageItemSaveActionsContainer } from './storage-item-save-actions-container';
import { getSaveOrder } from '../../storage/util/get-save-order';

export const StorageItemSaveActions: React.FC<{ saveId: number }> = ({ saveId }) => {
    const { t } = useTranslate();

    const navigate = Route.useNavigate();
    const selected = Route.useSearch({ select: (search) => search.selected });

    const formEditMode = StorageDetailsForm.useEditMode();

    const moveClickable = StorageMoveContext.useClickable(selected?.id ?? '', saveId);

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

    return <StorageItemSaveActionsContainer saveId={saveId} pkmId={selectedPkm.id}>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxWidth: 170,
            }}
        >
            {moveClickable.onClick && <Button onClick={moveClickable.onClick}>
                <Icon name='logout' solid forButton />
                {t('storage.actions.move')}
            </Button>}

            {moveClickable.onClickAttached && <ButtonWithDisabledPopover
                as={Button}
                onClick={moveClickable.onClickAttached}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.move-attached-save.helpTitle')}
                helpContent={
                    t('storage.actions.move-attached-save.helpContent')
                }
            >
                <Icon name='link' solid forButton />
                <Icon name='logout' solid forButton />
                {t('storage.actions.move-attached-save')}
            </ButtonWithDisabledPopover>}

            {canGoToMain && attachedPkmVersion && <ButtonWithDisabledPopover
                as={Button}
                onClick={() => navigate({
                    search: ({ saves }) => ({
                        mainBoxId: attachedPkm?.boxId,
                        selected: {
                            id: attachedPkmVersion.pkmId,
                        },
                        saves: {
                            ...saves,
                            [ selectedPkm.saveId ]: {
                                saveId: selectedPkm.saveId,
                                saveBoxId: selectedPkm.box,
                                order: getSaveOrder(saves, selectedPkm.saveId),
                            }
                        },
                    })
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.go-save.helpTitle')}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.go-save')}
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
                        id: selectedPkm.id,
                        params: {
                            saveId: selectedPkm.saveId,
                        },
                    });
                    const newId = mutateResult.data.saves
                        ?.find(save => save.saveId === saveId)?.savePkms
                        ?.find(pkm => pkm.box === selectedPkm.box && pkm.boxSlot === selectedPkm.boxSlot)?.id;
                    if (newId) {
                        navigate({
                            search: {
                                selected: {
                                    id: newId,
                                    saveId,
                                }
                            }
                        });
                    }
                }}
            >
                <Icon name='sparkles' solid forButton />
                {t('storage.actions.evolve')}
            </ButtonWithConfirm>}

            {canDetach && attachedPkmVersion && <ButtonWithDisabledPopover
                as={Button}
                onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                    pkmId: attachedPkmVersion.pkmId,
                })}
                showHelp
                anchor='right start'
                helpTitle={t('storage.actions.detach-save.helpTitle')}
                helpContent={t('storage.actions.detach-save.helpContent')}
            >
                <Icon name='link' solid forButton />
                {t('storage.actions.detach-save')}
            </ButtonWithDisabledPopover>}
        </div>
    </StorageItemSaveActionsContainer>;
};
