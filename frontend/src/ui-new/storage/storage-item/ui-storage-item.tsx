import { Checkbox } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { MoveParams } from '../../../storage/move/move-container-fns';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../../interaction/focus-controls/common-controls/drag-controls';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../../interaction/focus-controls/components/popover/hooks/use-popover';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { DragRender } from '../../interaction/move/components/drag-render';
import { useDragSubmitting } from '../../interaction/move/hooks/use-drag-submitting';
import { useDragging } from '../../interaction/move/hooks/use-dragging';
import { useDroppable } from '../../interaction/move/hooks/use-droppable';
import { useSelectContextActions, useSelectHasValue } from '../../interaction/select/context/use-select-context';
import { useCurrentPanel } from '../storage-content/context/ui-panel-context';
import { UIDetailsLevel } from '../storage-details/ui-details-level';
import { UIStorageItemBase } from './base/ui-storage-item-base';
import type { UIStorageItemPlaceholderProps } from './placeholder/ui-storage-item-placeholder';
import classes from './ui-storage-item.module.css';

export type UIStorageItemProps<C = unknown> =
    & UIStorageItemPlaceholderProps<C>
    & {
        id: string;
        name: string;
        level: number;
        icons?: React.ReactNode;
    };

export const UIStorageItem: React.FC<UIStorageItemProps> = ({
    ref: refRoot, id, nodeId, slot, icons,
    container,
    name, level, label,
    loading, disabled, onClick,
    children, ...buttonProps
}) => {
    // console.log('item', box, id)

    const panel = useCurrentPanel();

    const setPopover = usePopover();

    const checked = useSelectHasValue(container, [ id ]);
    const { addId, removeId } = useSelectContextActions();

    const dragging = useDragging(id, container);
    const draggingMove = dragging.useDrag();
    const draggingMoveAttached = dragging.useDrag<MoveParams>({ attached: true });

    const droppable = useDroppable({
        targetContainer: container,
        targetPosition: slot,
        targetId: id,
    });

    const isDraggingState = dragging.isDragging || droppable.isDroppable;

    disabled ||= (isDraggingState && !droppable.isDroppable);

    const submitting = useDragSubmitting(container, slot, id);

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: nodeId,
        onFocus: ({ node }) => {
            dragging.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            getSelectControl({
                label: 'Open',
                action: e => {
                    setPopover?.(s => ({
                        opened: !s.opened,
                    }));
                    onClick?.(e);
                },
            }),
            ...getDragControls({ dragging, draggingMove, draggingMoveAttached, droppable }),
            !dragging.isDragging && !droppable.isDroppable && {
                name: 'select',
                label: 'Select',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                        allowOnFocus: true,
                    },
                },
                spread: false,
                action: () => checked ? removeId([ id ]) : addId(container, [ id ]),
            },
        ],
    });

    const ref = useMergedRef(
        dragging.ref,
        focusControlProps.ref,
        refRoot,
    );

    return <>
        <WithControlsIcons
            placement='out' icons={[
                controlsIcons.open,
                controlsIcons.drag,
                controlsIcons[ 'drag-attached' ],
                controlsIcons.drop,
            ]}
            className={classes.uiStorageItem}
        >
            <UIStorageItemBase
                label={label ?? <>
                    {name}
                    <UIDetailsLevel level={level} />
                </>}
                loading={loading || submitting}
                disabled={disabled}
                opacity={dragging.isDragging ? 0.5 : undefined}
                {...focusControlProps}
                {...buttonProps}
                ref={ref}
            >
                {children}
                {icons}
            </UIStorageItemBase>

            {!submitting && !disabled && <WithControlsIcons className={classes.checkbox} placement='out' icons={controlsIcons.select}>
                <Checkbox
                    size='sm'
                    checked={checked}
                    onClick={() => checked ? removeId([ id ]) : addId(container, [ id ])}
                />
            </WithControlsIcons>}
        </WithControlsIcons>

        {dragging.isDragging && <DragRender elementRef={dragging.ref}>
            <UIStorageItemBase
                opacity={0.75}
            >
                {children}
            </UIStorageItemBase>
        </DragRender>}
    </>;
};
