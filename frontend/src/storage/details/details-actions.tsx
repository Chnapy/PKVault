import { Group } from '@mantine/core';
import { LinkIcon, MoveIcon, PencilIcon, SparklesIcon, TrashIcon, UnlinkIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import type { PkmSaveDTO } from '../../data/sdk/model';
import { useStorageEvolvePkms, useStorageMainDeletePkmVariant, useStorageMainPkmDetachSave, useStorageSaveDeletePkms } from '../../data/sdk/storage/storage.gen';
import { UIConfirmPopover } from '../../ui-new/popover/ui-confirm-popover';
import { UIPopover } from '../../ui-new/popover/ui-popover';
import { UIButton } from '../../ui-new/form/button/ui-button';
import { useControls } from '../../ui-new/interaction/controls/use-controls';
import { getDragControls } from '../../ui-new/interaction/focus-controls/common-controls/drag-controls';
import type { PopoverContext } from '../../ui-new/interaction/focus-controls/components/popover/context/popover-context';
import { useFocusScopeContext } from '../../ui-new/interaction/focus/scope/use-focus-scope-context';
import { useDragging } from '../../ui-new/interaction/move/hooks/use-dragging';
import { filterIsDefined } from '../../util/filter-is-defined';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';
import type { MoveContainerValue, MoveParams } from '../move/move-container-fns';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { DetailsEdit } from './details-edit';

type DetailsActionsProps = {
    pkmIds: string[];
    saveId: number | null;
};

export const DetailsActions: React.FC<DetailsActionsProps> = ({ pkmIds, saveId }) => {
    const { storageIndex } = useCurrentStorage();

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

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
    const draggingMove = dragging.useDrag();
    const draggingMoveAttached = dragging.useDrag<MoveParams>({ attached: true });

    const attachedVariantIds = attachedVariantIdsQuery.data ?? [];
    const canEditList = pkms.filter(pkm => pkm.canEdit);
    const canEvolveList = pkms.filter(pkm => pkm.canEvolve);
    const canReleaseList = pkms.filter(pkm => pkm.canDelete);

    const editPopoverRef = React.useRef<PopoverContext[ 'setOpened' ]>(null);

    const nodeId = `storage-item-${storageIndex}-${pkmToMove?.boxSlot}`;

    const { controlsIcons } = useControls(
        nodeId,
        true,
        order,
        [
            ...getDragControls({ dragging, draggingMove }),
            {
                name: 'edit' as const,
                label: 'Edit',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    },
                },
                spread: false,
                action: () => editPopoverRef.current?.(opened => !opened),
            },
        ],
        { enabled: true }
    );

    const refProps = { ref: dragging.ref };

    const renderCount = (count: number) => {
        if (count < 2)
            return null;
        return <>({count})</>;
    };

    return <Group>
        <UIButton
            name='move'
            controlLabel='Move'
            controlIcons={[ controlsIcons.drag ]}
            onClick={draggingMove.toggleDragByClick}
            onFocusSelect={draggingMove.toggleDragByFocus}
            size='compact-md'
            leftSection={<MoveIcon />}
            focusOnMount
            {...refProps}
        >
            Move
        </UIButton>

        {attachedVariantIds.length > 0
            ? <UIButton
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
                Detach {renderCount(attachedVariantIds.length)}
            </UIButton>
            : <UIButton
                name='move-attached'
                controlLabel='Move attached'
                onClick={draggingMoveAttached.toggleDragByClick}
                onFocusSelect={draggingMoveAttached.toggleDragByFocus}
                size='compact-md'
                leftSection={<Group gap='sm'>
                    <MoveIcon />
                    <LinkIcon />
                </Group>}
            >
                Move attached
            </UIButton>}

        {canEditList.length < 2 && <UIPopover
            popoverRef={editPopoverRef}
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
                controlIcons={[ controlsIcons.edit ]}
                disabled={canEditList.length === 0}
                variant='filled'
                color='blue'
                size='compact-md'
                leftSection={<PencilIcon />}
            >
                Edit
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
                Evolve {renderCount(canEvolveList.length)}
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
                Release {renderCount(canReleaseList.length)}
            </UIButton>
        </UIConfirmPopover>
    </Group>;
};
