import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getSelectControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'spread'>) => ({
    main: true,
    ...partial,
    name: 'open' as const,
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
} satisfies ControlActionInput);
