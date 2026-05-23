import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getSelectControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'spread'>): ControlActionInput => ({
    ...partial,
    name: 'open',
    triggers: {
        mouse: {
            type: 'mouse',
            values: [ 'left-click' ],
        },
        keyboard: {
            type: 'keyboard',
            values: [ 'Space' ],
        },
        gamepad: {
            type: 'gamepad',
            values: [ 'A' ],
        },
    },
    spread: false,
});
