import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getBackControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'spread'>) => ({
    ...partial,
    name: 'back' as const,
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
} satisfies ControlActionInput);
