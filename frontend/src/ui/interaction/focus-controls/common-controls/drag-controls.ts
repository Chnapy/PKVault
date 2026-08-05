import { useTranslate } from '../../../../translate/i18n';
import type { ControlsWithFalsy } from '../../controls/provider/controls-context';
import type { UseDraggingReturn } from '../../move/hooks/use-dragging';
import type { UseDroppableReturn } from '../../move/hooks/use-droppable';

type Params = {
    dragging?: Pick<UseDraggingReturn, 'isDragging' | 'stopDrag' | 'onPointerDown'>;
    draggingMove?: ReturnType<UseDraggingReturn[ 'useDrag' ]>;
    draggingMoveAttached?: ReturnType<UseDraggingReturn[ 'useDrag' ]>;
    droppable?: Pick<UseDroppableReturn, 'isDroppable' | 'stopDrag' | 'onDrop' | 'canDrop'>;
    droppableMain?: boolean;
    disabled?: boolean;
};

export const useDragControls = ({ dragging, draggingMove, draggingMoveAttached, droppable, droppableMain, disabled }: Params) => {
    const { t } = useTranslate();

    const isDragging = dragging?.isDragging;

    return [
        !disabled && droppable?.onDrop && droppable.canDrop && {
            name: 'drop' as const,
            main: droppableMain,
            label: t('storage.actions.drop'),
            triggers: {
                mouse: {
                    type: 'mouse',
                    values: [ 'left-click' ],
                    listeners: [ 'onClick', 'onPointerUp' ],
                },
                keyboard: {
                    type: 'keyboard',
                    values: [ 'KeyX' ],
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
        !disabled && dragging && draggingMove && !droppable?.onDrop && !isDragging && draggingMove.toggleDragByFocus && {
            name: 'drag' as const,
            label: t('storage.actions.move'),
            triggers: {
                mouse: {
                    type: 'mouse',
                    values: [ 'drag' ],
                    listeners: [ 'onPointerDown' ],
                },
                keyboard: {
                    type: 'keyboard',
                    values: [ 'KeyX' ],
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
                        draggingMove.toggleDragByFocus?.(e);
                        break;
                    }
                }
            },
            spread: false,
        },
        !disabled && dragging && draggingMoveAttached && !droppable?.onDrop && !isDragging && draggingMoveAttached.toggleDragByFocus && {
            name: 'drag-attached' as const,
            label: t('storage.actions.move-attached'),
            triggers: {
                // mouse: {
                //     type: 'mouse',
                //     values: [ 'drag' ],
                //     listeners: [ 'onPointerDown' ],
                // },
                // keyboard: {
                //     type: 'keyboard',
                //     values: [ 'KeyX' ],
                // },
                gamepad: {
                    type: 'gamepad',
                    values: [ 'X' ],
                    allowPressedSuite: 4,
                },
            },
            action: (e) => {
                draggingMoveAttached.toggleDragByFocus?.(e);
            },
            spread: false,
        },
    ] satisfies ControlsWithFalsy;
};
