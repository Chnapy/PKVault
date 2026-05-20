import type { ControlActionInput } from '../../controls/provider/controls-context';
import type { UseDraggingReturn } from '../../move/hooks/use-dragging';

export const getDragControls = (dragging: Pick<UseDraggingReturn, 'onPointerDown' | 'toggleDragByFocus'>): ControlActionInput => {
    return {
        name: 'drag',
        label: 'Move',
        triggers: {
            mouse: {
                type: 'mouse',
                values: [ 'drag' ],
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
            switch(trigger) {
                case 'mouse':
                    dragging.onPointerDown?.(e as React.PointerEvent);
                    break;
                default:
                    dragging.toggleDragByFocus(e as React.BaseSyntheticEvent);
            }
        },
        spread: false,
    };
};
