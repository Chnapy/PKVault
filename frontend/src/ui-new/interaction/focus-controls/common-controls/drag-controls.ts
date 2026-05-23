import type { ControlsWithFalsy } from '../../controls/provider/controls-context';
import type { UseDraggingReturn } from '../../move/hooks/use-dragging';
import type { UseDroppableReturn } from '../../move/hooks/use-droppable';

type Params = {
    dragging?: Pick<UseDraggingReturn, 'stopDrag' | 'onPointerDown' | 'toggleDragByFocus'>;
    droppable?: Pick<UseDroppableReturn, 'stopDrag' | 'onDrop'>;
};

export const getDragControls = ({ dragging, droppable }: Params): ControlsWithFalsy => {
    const stopDrag = dragging?.stopDrag ?? droppable?.stopDrag;

    if (droppable?.onDrop) {
        return [
            {
                name: 'drop',
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
            stopDrag && {
                name: 'drag-cancel',
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
        ];
    }

    return [
        dragging && {
            name: 'drag',
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
                        dragging.toggleDragByFocus(e);
                        break;
                    }
                }
            },
            spread: false,
        },
    ];
};
