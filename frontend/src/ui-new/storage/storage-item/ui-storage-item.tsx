import { Checkbox } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { MoveParams } from '../../../storage/move/move-container-fns';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getDragControls } from '../../interaction/focus-controls/common-controls/drag-controls';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
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
        selected?: boolean;
        level: number;
        icons?: React.ReactNode;
    };

export const UIStorageItem: React.FC<UIStorageItemProps> = ({
    ref: refRoot, id, nodeId, slot, globalOrder, icons,
    container, selected,
    name, level, label,
    loading, disabled, onClick,
    children, ...buttonProps
}) => {
    // console.log('item', box, id)

    const panel = useCurrentPanel();

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

    const submitting = useDragSubmitting(container, slot, id);

    disabled ||= (isDraggingState && !droppable.isDroppable) || droppable.canDrop === false;
    loading ||= submitting;

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: nodeId,
        order: globalOrder,
        onFocus: ({ node }) => {
            dragging.focusNode(node);

            panel.normalizeCurrentPanel();
        },
        controls: [
            !isDraggingState && !disabled && !loading && getSelectControl({
                label: 'Open',
                action: e => {
                    onClick?.(e);
                },
            }),
            ...(disabled || loading)
                ? []
                : getDragControls({ dragging, draggingMove, draggingMoveAttached, droppable }),
            !isDraggingState && !disabled && !loading && {
                name: 'select',
                label: 'Select',
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    },
                },
                spread: true,
                action: () => checked ? removeId([ id ]) : addId(container, [ id ]),
            },
        ],
    });

    const ref = useMergedRef(
        dragging.ref,
        focusProps.ref,
        refRoot,
    );

    return <>
        <WithControlsIcons
            placement='out' icons={controlIcons('open', 'drag', 'drag-attached', 'drop')}
            className={classes.uiStorageItem}
        >
            <UIStorageItemBase
                label={droppable.helpText ?? <>
                    {name}
                    <UIDetailsLevel level={level} />
                </>}
                selected={selected}
                loading={loading}
                opacity={dragging.isDragging ? 0.5 : undefined}
                {...focusProps}
                {...controlProps('open', 'drag', 'drag-attached', 'drop')}
                {...buttonProps}
                ref={ref}
            >
                {children}
                {icons}
            </UIStorageItemBase>

            {controlProps('select').onClick && <WithControlsIcons className={classes.checkbox} placement='out' icons={controlIcons('select')}>
                <Checkbox
                    size='sm'
                    checked={checked}
                    {...controlProps('select')}
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
