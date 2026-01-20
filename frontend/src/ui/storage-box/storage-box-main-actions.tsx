import { css } from '@emotion/css';
import { PopoverPanel, type PopoverPanelProps } from '@headlessui/react';
import type React from 'react';
import {
    useStorageEvolvePkms,
    useStorageGetMainPkmVersions,
    useStorageMainDeletePkmVersion,
    useStorageMainPkmDetachSave,
} from '../../data/sdk/storage/storage.gen';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { StorageSelectContext } from '../../storage/actions/storage-select-context';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../button/button-with-disabled-popover';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { theme } from '../theme';

export const StorageBoxMainActions: React.FC<Required<Pick<PopoverPanelProps, 'anchor'>> & { boxId: number }> = ({ boxId, anchor }) => {
    const { t } = useTranslate();

    const { ids, hasBox } = StorageSelectContext.useValue();

    const mainPkmVersionQuery = useStorageGetMainPkmVersions();

    const pkms = mainPkmVersionQuery.data?.data.filter(pkm => ids.includes(pkm.id)) ?? [];

    const moveClickable = StorageMoveContext.useClickable(
        pkms.map(pkm => pkm.id),
        undefined,
    );

    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    const mainPkmVersionDeleteMutation = useStorageMainDeletePkmVersion();
    const evolvePkmsMutation = useStorageEvolvePkms();

    if (pkms.length === 0 || !hasBox(undefined, boxId)) {
        return null;
    }

    const canEvolvePkms = pkms.filter(pkmVersion => pkmVersion.canEvolve);

    const canDetachPkms = pkms.filter(pkm => pkm.attachedSaveId);
    const canRemovePkms = pkms.filter(pkm => pkm.canDelete);

    return (
        <PopoverPanel
            static
            anchor={anchor}
            className={css({
                zIndex: 18,
                '&:hover': {
                    zIndex: 25,
                },
            })}
        >
            <div style={{ maxWidth: 350, whiteSpace: 'break-spaces' }}>
                <TitledContainer
                    contrasted
                    enableExpand
                    title={
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            {t('storage.actions.select-title', { count: ids.length })}
                        </div>
                    }
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            minWidth: 140,
                        }}
                    >
                        {moveClickable.onClick && (
                            <Button onClick={moveClickable.onClick}>
                                <Icon name='logout' solid forButton />
                                {t('storage.actions.move')} ({moveClickable.moveCount})
                            </Button>
                        )}

                        {moveClickable.onClickAttached && (
                            <ButtonWithDisabledPopover
                                as={Button}
                                onClick={moveClickable.onClickAttached}
                                showHelp
                                anchor='right start'
                                helpTitle={t('storage.actions.move-attached-main.helpTitle')}
                                helpContent={t('storage.actions.move-attached-main.helpContent')}
                            >
                                <Icon name='link' solid forButton />
                                <Icon name='logout' solid forButton />
                                {t('storage.actions.move-attached-main')} ({moveClickable.moveAttachedCount})
                            </ButtonWithDisabledPopover>
                        )}

                        {canEvolvePkms.length > 0 && (
                            <ButtonWithConfirm
                                anchor='right'
                                bgColor={theme.bg.primary}
                                onClick={async () => {
                                    await evolvePkmsMutation.mutateAsync({
                                        params: {
                                            ids: canEvolvePkms.map(pkm => pkm.id),
                                        },
                                    });
                                }}
                            >
                                <Icon name='sparkles' solid forButton />
                                {t('storage.actions.evolve')} ({canEvolvePkms.length})
                            </ButtonWithConfirm>
                        )}

                        {canDetachPkms.length > 0 && (
                            <ButtonWithDisabledPopover
                                as={Button}
                                onClick={() =>
                                    mainPkmDetachSaveMutation.mutateAsync({
                                        params: {
                                            pkmIds: canDetachPkms.map(pkm => pkm.id),
                                        },
                                    })
                                }
                                showHelp
                                anchor='right start'
                                helpTitle={t('storage.actions.detach-main.helpTitle')}
                                helpContent={t('storage.actions.detach-main.helpContent')}
                            >
                                <Icon name='link' solid forButton />
                                {t('storage.actions.detach-main')} ({canDetachPkms.length})
                            </ButtonWithDisabledPopover>
                        )}

                        {canRemovePkms.length > 0 && (
                            <ButtonWithConfirm
                                anchor='right'
                                bgColor={theme.bg.red}
                                onClick={async () => {
                                    await mainPkmVersionDeleteMutation.mutateAsync({
                                        params: {
                                            pkmVersionIds: canRemovePkms.map(pkmVersion => pkmVersion.id),
                                        },
                                    });
                                }}
                            >
                                <Icon name='trash' solid forButton />
                                {t('storage.actions.release')} ({canRemovePkms.length})
                            </ButtonWithConfirm>
                        )}
                    </div>
                </TitledContainer>
            </div>
        </PopoverPanel>
    );
};
