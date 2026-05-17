import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getBackControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'spread'>): ControlActionInput => ({
    ...partial,
    name: 'back',
    triggers: {
        keyboard: {
            type: 'keyboard',
            values: [ 'Backspace' ],
        },
        mouse: {
            type: 'mouse',
            values: [ 'right-click' ],
        },
        gamepad: {
            type: 'gamepad',
            values: [ 'B' ],
        },
    },
    spread: true,
});
