import { Group, Tooltip } from '@mantine/core';
import { LinkIcon, MoveIcon, PencilIcon, SparklesIcon, TrashIcon, UnlinkIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { PkmSaveDTO } from '../../data/sdk/model';
import { useStorageEvolvePkms, useStorageMainDeletePkmVariant, useStorageMainPkmDetachSave, useStorageSaveDeletePkms } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { UIButton, type UIButtonProps } from '../../ui-new/form/button/ui-button';
import { useControlsCurrentType } from '../../ui-new/interaction/controls/use-controls-current-type';
import { useDragging } from '../../ui-new/interaction/move/hooks/use-dragging';
import { UIConfirmPopover } from '../../ui-new/popover/ui-confirm-popover';
import { UIPopover } from '../../ui-new/popover/ui-popover';
import { filterIsDefined } from '../../util/filter-is-defined';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';
import type { MoveContainerValue, MoveParams } from '../move/move-container-fns';
import { DetailsEdit } from './details-edit';

type DetailsActionsProps = Pick<UIButtonProps, 'focusOnMount'> & {
    pkmIds: string[];
    saveId: number | null;
};

export const DetailsActions: React.FC<DetailsActionsProps> = ({ focusOnMount, pkmIds, saveId }) => {
    const { t } = useTranslate();

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            return pkmIds.map(id => data.data.byId[ id ]).filter(filterIsDefined)
                .map(pkm => ({
                    ...pick(pkm, [ 'id', 'boxId', 'boxSlot', 'canEdit', 'canEvolve', 'canDelete' ]),
                    idBase: saveId ? (pkm as PkmSaveDTO).idBase : '',
                }));
        }, [ pkmIds, saveId ]));

    const attachedVariantIdsQuery = usePkmVariantIndex(
        useSelectCallback(data => {
            return pkmIndexQuery.data?.map(pkm => {

                if (saveId)
                    return data.data.byAttachedSave[ saveId ]?.[ pkm.idBase ]?.id;

                const variants = data.data.byBox[ pkm.boxId ]?.[ pkm.boxSlot ] ?? [];
                return variants.find(variant => variant.attachedSaveId)?.id;
            }).filter(filterIsDefined);
        }, [ pkmIndexQuery.data, saveId ])
    );

    const pkms = pkmIndexQuery.data ?? [];

    const boxId = pkms[ 0 ]?.boxId;

    const mainPkmDetachSaveMutation = useStorageMainPkmDetachSave();
    const mainPkmVariantDeleteMutation = useStorageMainDeletePkmVariant();
    const savePkmDeleteMutation = useStorageSaveDeletePkms();
    const evolvePkmsMutation = useStorageEvolvePkms();

    const container = React.useMemo((): MoveContainerValue => saveId
        ? {
            type: 'save-item',
            saveId,
            boxId: boxId?.toString() ?? '',
        }
        : {
            type: 'main-item',
            boxId: boxId?.toString() ?? '',
        }, [ boxId, saveId ]);

    const pkmToMove = pkms[ 0 ];

    const dragging = useDragging(pkmToMove?.id ?? '', container, false);
    // eslint-disable-next-line react-hooks/refs
    const draggingMove = dragging.useDrag();
    // eslint-disable-next-line react-hooks/refs
    const draggingMoveAttached = dragging.useDrag<MoveParams>({ attached: true });

    const attachedVariantIds = attachedVariantIdsQuery.data ?? [];
    const canEditList = pkms.filter(pkm => pkm.canEdit);
    const canEvolveList = pkms.filter(pkm => pkm.canEvolve);
    const canReleaseList = pkms.filter(pkm => pkm.canDelete);

    const controlsType = useControlsCurrentType();

    const renderCount = (count: number) => {
        if (count < 2)
            return null;
        return <>({count})</>;
    };

    const onClickMove: UIButtonProps[ 'onClick' ] = controlsType === 'mouse'
        ? draggingMove.toggleDragByClick
        : draggingMove.toggleDragByFocus;

    const onClickMoveAttached: UIButtonProps[ 'onClick' ] = controlsType === 'mouse'
        ? draggingMoveAttached.toggleDragByClick
        : draggingMoveAttached.toggleDragByFocus;

    return <Group>
        <UIButton
            name='move'
            controlLabel='Move'
            onClick={onClickMove}
            size='compact-md'
            leftSection={<MoveIcon />}
            focusOnMount={focusOnMount}
            // eslint-disable-next-line react-hooks/refs
            ref={dragging.ref}
        >
            {t('storage.actions.move')}
        </UIButton>

        {attachedVariantIds.length > 0
            ? <Tooltip
                multiline
                w={300}
                label={(saveId
                    ? [ t('storage.actions.detach-save.helpTitle'), t('storage.actions.detach-save.helpContent') ]
                    : [ t('storage.actions.detach-main.helpTitle'), t('storage.actions.detach-main.helpContent') ]
                ).join('\n\n')}>
                <UIButton
                    name='detach'
                    controlLabel='Detach'
                    onClick={() =>
                        mainPkmDetachSaveMutation.mutateAsync({
                            params: {
                                pkmVariantIds: attachedVariantIds,
                            },
                        })
                    }
                    size='compact-md'
                    leftSection={<UnlinkIcon />}
                >
                    {saveId ? t('storage.actions.detach-save') : t('storage.actions.detach-main')} {renderCount(attachedVariantIds.length)}
                </UIButton>
            </Tooltip>
            : <Tooltip
                multiline
                w={300}
                label={(saveId
                    ? [ t('storage.actions.move-attached-save.helpTitle'), t('storage.actions.move-attached-save.helpContent') ]
                    : [ t('storage.actions.move-attached-main.helpTitle'), t('storage.actions.move-attached-main.helpContent') ]
                ).join('\n\n')}>
                <UIButton
                    name='move-attached'
                    controlLabel='Move attached'
                    onClick={onClickMoveAttached}
                    size='compact-md'
                    leftSection={<Group gap='sm'>
                        <MoveIcon />
                        <LinkIcon />
                    </Group>}
                >
                    {t('storage.actions.move-attached-main')}
                </UIButton>
            </Tooltip>}

        {canEditList.length < 2 && <UIPopover
            position='left'
            nested
            dropdown={canEditList[ 0 ] && <DetailsEdit
                pkmId={canEditList[ 0 ].id}
                saveId={saveId}
            />}
        >
            <UIButton
                name='edit'
                controlLabel='Edit'
                variant='filled'
                color='blue'
                size='compact-md'
                leftSection={<PencilIcon />}
            >
                {t('storage.actions.edit')}
            </UIButton>
        </UIPopover>}

        {canEvolveList.length > 0 && <UIConfirmPopover
            label='Evolve'
            color='blue'
            action={async () => {
                if (canEvolveList.length === 0)
                    return;

                await evolvePkmsMutation.mutateAsync({
                    params: {
                        saveId: saveId ?? undefined,
                        ids: canEvolveList.map(pkm => pkm.id),
                    },
                });

                // const pkms = saveId
                //     ? Object.values(mutateResult.data.saves?.find(save => save.saveId === saveId)?.savePkms?.data ?? {})
                //     : Object.values(mutateResult.data.mainPkmVariants?.data ?? {});
                // const newId = pkms.find(p => p.boxId === pkm.boxId && p.boxSlot === pkm.boxSlot)?.id;

                // if (newId) {
                //     navigate({
                //         search: search => ({
                //             selected: {
                //                 ...search.selected!,
                //                 id: newId,
                //                 saveId: saveId ?? undefined,
                //             },
                //         }),
                //     });
                // }
            }}
        >
            <UIButton
                name='evolve'
                controlLabel='Evolve'
                variant='filled'
                color='blue'
                size='compact-md'
                leftSection={<SparklesIcon />}
            >
                {t('storage.actions.evolve')} {renderCount(canEvolveList.length)}
            </UIButton>
        </UIConfirmPopover>}

        <UIConfirmPopover
            label='Release'
            color='red'
            action={async () => {
                if (canReleaseList.length === 0)
                    return;

                if (saveId) {
                    await savePkmDeleteMutation.mutateAsync({
                        saveId: saveId,
                        params: {
                            pkmIds: canReleaseList.map(pkm => pkm.id),
                        },
                    });
                } else {
                    await mainPkmVariantDeleteMutation.mutateAsync({
                        params: {
                            pkmVariantIds: canReleaseList.map(pkm => pkm.id),
                        },
                    });
                }
                // unselect();
            }}
        >
            <UIButton
                name='release'
                controlLabel='Release'
                variant='filled'
                color='red'
                size='compact-md'
                leftSection={<TrashIcon />}
                disabled={canReleaseList.length === 0}
            >
                {t('storage.actions.release')} {renderCount(canReleaseList.length)}
            </UIButton>
        </UIConfirmPopover>
    </Group>;
};
