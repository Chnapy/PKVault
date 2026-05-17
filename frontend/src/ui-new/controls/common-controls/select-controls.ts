import type { ControlAction } from '../provider/controls-context';

export const getSelectControl = (partial: Pick<ControlAction, 'label' | 'action'>): ControlAction => ({
    ...partial,
    name: 'select',
    triggers: {
        keyboard: {
            type: 'keyboard',
            icon: 'Space',
            values: [ 'Space' ],
        },
        mouse: {
            type: 'mouse',
            icon: 'ML',
            values: [ 'left-click' ],
        },
        gamepad: {
            type: 'gamepad',
            icon: 'A',
            values: [ 'A' ],
        },
    },
});
