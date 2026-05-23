import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getBackControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'spread'>): ControlActionInput => ({
    ...partial,
    name: 'back',
    triggers: {
        // mouse: {
        //     type: 'mouse',
        //     values: [ 'right-click' ],
        // },
        keyboard: {
            type: 'keyboard',
            values: [ 'Backspace' ],
        },
        gamepad: {
            type: 'gamepad',
            values: [ 'B' ],
        },
    },
    spread: true,
});
