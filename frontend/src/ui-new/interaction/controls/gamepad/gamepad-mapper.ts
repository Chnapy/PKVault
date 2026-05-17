
type Direction = 'Left' | 'Right' | 'Up' | 'Down';

type GamepadStick = 'LStick' | 'RStick';
type GamepadAxis = `${GamepadStick}${Direction}`;
type GamepadButton = 'A' | 'B' | 'X' | 'Y' | 'LB' | 'RB' | 'LT' | 'RT' | 'SELECT' | 'START' | GamepadStick | `DPad${Direction}`;

type GamepadMappings = {
    axis: Record<number, GamepadAxis>;
    button: Record<number, GamepadButton>;
};

export type GamepadMappingsAllButton = GamepadMappings[keyof GamepadMappings][number];

export type GamepadMappingType = keyof GamepadMappings;

const gamepadsMappings: Record<string, GamepadMappings> = {
    default: {
        axis: {
            0: 'LStickLeft',
            1: 'LStickRight',
            2: 'LStickUp',
            3: 'LStickDown',
            
            4: 'RStickLeft',
            5: 'RStickRight',
            6: 'RStickUp',
            7: 'RStickDown',
        },
        button: {
            0: 'A',
            1: 'B',
            2: 'X',
            3: 'Y',

            4: 'LB',
            5: 'RB',
            6: 'LT',
            7: 'RT',

            8: 'SELECT',
            9: 'START',

            10: 'LStick',
            11: 'RStick',
            
            12: 'DPadUp',
            13: 'DPadDown',
            14: 'DPadLeft',
            15: 'DPadRight',
        },
    },
};

export const getGamepadMapping = (gamepadId: string, type: GamepadMappingType, value: number): GamepadMappingsAllButton | undefined => {
    const mapping = gamepadsMappings[gamepadId] ?? gamepadsMappings.default!;

    return mapping[type][value];
};
