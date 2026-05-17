import type { ControlAction } from '../provider/controls-context';

export const getBackControl = (partial: Pick<ControlAction, 'label' | 'action'>): ControlAction => ({
    ...partial,
    name: 'back',
    triggers: {
        keyboard: {
            type: 'keyboard',
            icon: 'Backspace',
            values: [ 'Backspace' ],
        },
        mouse: {
            type: 'mouse',
            icon: 'MR',
            values: [ 'right-click' ],
        },
        gamepad: {
            type: 'gamepad',
            icon: 'B',
            values: [ 'B' ],
        },
    },
});
