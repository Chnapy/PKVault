import type { ControlsWithFalsy } from '../../controls/provider/controls-context';
import type { UseDraggingReturn } from '../../move/hooks/use-dragging';
import type { UseDroppableReturn } from '../../move/hooks/use-droppable';

type Params = {
    dragging?: Pick<UseDraggingReturn, 'isDragging' | 'stopDrag' | 'onPointerDown' | 'toggleDragByFocus'>;
    droppable?: Pick<UseDroppableReturn, 'isDroppable' | 'stopDrag' | 'onDrop'>;
};

export const getDragControls = ({ dragging, droppable }: Params) => {
    const stopDrag = dragging?.stopDrag ?? droppable?.stopDrag;

    const isDragging = dragging?.isDragging;
    const isDroppable = droppable?.isDroppable;

    return [
        droppable?.onDrop && {
            name: 'drop' as const,
            label: 'Drop',
            triggers: {
                mouse: {
                    type: 'mouse',
                    values: [ 'left-click' ],
                    listeners: [ 'onClick', 'onPointerUp' ],
                },
                keyboard: {
                    type: 'keyboard',
                    values: [ 'x' ],
                },
                gamepad: {
                    type: 'gamepad',
                    values: [ 'X' ],
                },
            },
            action: (e) => {
                droppable.onDrop?.(e);
            },
            spread: false,
        },
        stopDrag && (isDragging || isDroppable) && {
            name: 'drag-cancel' as const,
            label: 'Cancel',
            triggers: {
                // mouse: {
                //     type: 'mouse',
                //     values: [ 'right-click' ],
                //     listeners: ['onClick'],
                // },
                keyboard: {
                    type: 'keyboard',
                    values: [ 'b' ],
                },
                gamepad: {
                    type: 'gamepad',
                    values: [ 'B' ],
                },
            },
            action: (e) => {
                stopDrag?.(e);
            },
            spread: false,
        },
        dragging && !droppable?.onDrop && !isDragging && {
            name: 'drag' as const,
            label: 'Move',
            triggers: {
                mouse: {
                    type: 'mouse',
                    values: [ 'drag' ],
                    listeners: [ 'onPointerDown' ],
                },
                keyboard: {
                    type: 'keyboard',
                    values: [ 'x' ],
                },
                gamepad: {
                    type: 'gamepad',
                    values: [ 'X' ],
                },
            },
            action: (e, trigger) => {
                switch (trigger) {
                    case 'mouse': {
                        dragging.onPointerDown?.(e);
                        break;
                    }
                    default: {
                        dragging.toggleDragByFocus(e, null);
                        break;
                    }
                }
            },
            spread: false,
        },
        dragging && !droppable?.onDrop && !isDragging && {
            name: 'drag-attached' as const,
            label: 'Move attached',
            triggers: {
                // mouse: {
                //     type: 'mouse',
                //     values: [ 'drag' ],
                //     listeners: [ 'onPointerDown' ],
                // },
                // keyboard: {
                //     type: 'keyboard',
                //     values: [ 'x' ],
                // },
                gamepad: {
                    type: 'gamepad',
                    values: [ 'X' ],
                    allowPressedSuite: 4,
                },
            },
            action: (e) => {
                dragging.toggleDragByFocus(e, { attached: true });
            },
            spread: false,
        },
    ] satisfies ControlsWithFalsy;
};
