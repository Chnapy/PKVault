import type React from 'react';
import { useStorageGetSavePkms } from '../../data/sdk/storage/storage.gen';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { StorageSelectContext } from '../../storage/actions/storage-select-context';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { PopoverPanel, type PopoverPanelProps } from '@headlessui/react';
import { css } from '@emotion/css';

export const StorageBoxSaveActions: React.FC<
    Required<Pick<PopoverPanelProps, 'anchor'>> & { saveId: number; boxId: number; }
> = ({ saveId, boxId, anchor }) => {
    const { t } = useTranslate();

    // const navigate = Route.useNavigate();
    const { ids, hasBox } = StorageSelectContext.useValue();

    // const mainPkmVersionQuery = useStorageGetMainPkmVersions();
    const pkmSavePkmQuery = useStorageGetSavePkms(saveId);

    const pkms = pkmSavePkmQuery.data?.data.filter(pkm => ids.includes(pkm.id)) ?? [];

    const pkmIds = pkms.map(pkm => pkm.id);

    const moveClickable = StorageMoveContext.useClickable(pkmIds, saveId);

    // const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    // const savePkmSynchronizeMutation = useStorageSaveSynchronizePkm();
    // const evolvePkmMutation = useStorageEvolvePkm();

    if (pkms.length === 0 || !hasBox(saveId, boxId)) {
        return null;
    }

    // const attachedPkmVersion = selectedPkm.pkmVersionId ? mainPkmVersionQuery.data?.data.find(version => version.id === selectedPkm.pkmVersionId) : undefined;

    // const saveSynchronized = selectedPkm.dynamicChecksum === attachedPkmVersion?.dynamicChecksum;

    // const canEvolve = selectedPkm.canEvolve && !selectedPkm.pkmVersionId;
    // const canDetach = !!selectedPkm.pkmVersionId;
    // const canSynchronize = !!selectedPkm.pkmVersionId && !!attachedPkmVersion && !saveSynchronized;

    return <PopoverPanel
        static
        anchor={anchor}
        className={css({
            zIndex: 18,
            '&:hover': {
                zIndex: 25,
            }
        })}
    >
        <div style={{ maxWidth: 350, whiteSpace: 'break-spaces' }}>
            <TitledContainer
                contrasted
                enableExpand
                title={<div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                }}>
                    {t('storage.actions.select-title', { count: ids.length })}
                </div>}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minWidth: 140,
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

                    {/* {canSynchronize && <Button
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
            </ButtonWithDisabledPopover>} */}
                </div>
            </TitledContainer>
        </div>
    </PopoverPanel>;
};
