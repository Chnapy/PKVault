import { css } from '@emotion/css';
import { PopoverPanel, type PopoverPanelProps } from '@headlessui/react';
import type React from 'react';
import { useStorageEvolvePkms, useStorageGetMainPkmVersions, useStorageGetSavePkms, useStorageMainPkmDetachSave, useStorageSaveDeletePkms } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { StorageSelectContext } from '../../storage/actions/storage-select-context';
import { useTranslate } from '../../translate/i18n';
import { filterIsDefined } from '../../util/filter-is-defined';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { theme } from '../theme';

export const StorageBoxSaveActions: React.FC<
    Required<Pick<PopoverPanelProps, 'anchor'>> & { saveId: number; boxId: number; }
> = ({ saveId, boxId, anchor }) => {
    const { t } = useTranslate();

    const { ids, hasBox } = StorageSelectContext.useValue();

    const staticData = useStaticData();

    const mainPkmVersionQuery = useStorageGetMainPkmVersions();
    const pkmSavePkmQuery = useStorageGetSavePkms(saveId);

    const pkms = pkmSavePkmQuery.data?.data.filter(pkm => ids.includes(pkm.id)) ?? [];

    const moveClickable = StorageMoveContext.useClickable(pkms.map(pkm => pkm.id), saveId);

    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    const savePkmsDeleteMutation = useStorageSaveDeletePkms();
    const evolvePkmsMutation = useStorageEvolvePkms();

    if (pkms.length === 0 || !hasBox(saveId, boxId)) {
        return null;
    }

    const canEvolvePkms = pkms.filter(pkm => {
        if (pkm.pkmVersionId) {
            return false;
        }

        const staticEvolves = staticData.evolves[ pkm.species ];
        const evolveSpecies = staticEvolves?.trade[ pkm.version ] ?? staticEvolves?.tradeWithItem[ pkm.heldItemPokeapiName ?? '' ]?.[ pkm.version ];
        return !!evolveSpecies && pkm.level >= evolveSpecies.minLevel;
    });

    const canDetachPkms = pkms
        .map(pkm => {
            if (!pkm.pkmVersionId) {
                return undefined;
            }

            return mainPkmVersionQuery.data?.data.find(version => version.id === pkm.pkmVersionId);
        })
        .filter(filterIsDefined);

    const canRemovePkms = pkms.filter(pkm => pkm.canDelete);

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
                        {t('storage.actions.move')} ({moveClickable.moveCount})
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
                        {t('storage.actions.move-attached-save')} ({moveClickable.moveAttachedCount})
                    </ButtonWithDisabledPopover>}

                    {canEvolvePkms.length > 0 && <ButtonWithConfirm
                        anchor='right'
                        bgColor={theme.bg.primary}
                        onClick={async () => {
                            await evolvePkmsMutation.mutateAsync({
                                params: {
                                    saveId,
                                    ids: canEvolvePkms.map(pkm => pkm.id),
                                },
                            });
                        }}
                    >
                        <Icon name='sparkles' solid forButton />
                        {t('storage.actions.evolve')} ({canEvolvePkms.length})
                    </ButtonWithConfirm>}

                    {canDetachPkms.length > 0 && <ButtonWithDisabledPopover
                        as={Button}
                        onClick={() => mainPkmDetachSaveMutation.mutateAsync({
                            params: {
                                pkmIds: canDetachPkms.map(pkm => pkm.pkmId),
                            }
                        })}
                        showHelp
                        anchor='right start'
                        helpTitle={t('storage.actions.detach-save.helpTitle')}
                        helpContent={t('storage.actions.detach-save.helpContent')}
                    >
                        <Icon name='link' solid forButton />
                        {t('storage.actions.detach-save')} ({canDetachPkms.length})
                    </ButtonWithDisabledPopover>}

                    {canRemovePkms.length > 0 && <ButtonWithConfirm
                        anchor='right'
                        bgColor={theme.bg.red}
                        onClick={async () => {
                            await savePkmsDeleteMutation.mutateAsync({
                                saveId,
                                params: {
                                    pkmIds: canRemovePkms.map(pkm => pkm.id),
                                },
                            });
                        }}
                    >
                        <Icon name='trash' solid forButton />
                        {t('storage.actions.release')} ({canRemovePkms.length})
                    </ButtonWithConfirm>}
                </div>
            </TitledContainer>
        </div>
    </PopoverPanel>;
};
