import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getSelectControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'spread'>): ControlActionInput => ({
    ...partial,
    name: 'select',
    triggers: {
        keyboard: {
            type: 'keyboard',
            values: [ 'Space' ],
        },
        mouse: {
            type: 'mouse',
            values: [ 'left-click' ],
        },
        gamepad: {
            type: 'gamepad',
            values: [ 'A' ],
        },
    },
    spread: false,
});
