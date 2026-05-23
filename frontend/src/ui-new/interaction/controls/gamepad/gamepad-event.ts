import { getGamepadMapping, type GamepadMappingsAllButton, type GamepadMappingType } from './gamepad-mapper';

const eventType = 'gamepad_pressed';

type GamepadEvent = CustomEvent<{
    button: GamepadMappingsAllButton | undefined;
    pressedSuite: number;
}>;

export const sendGamepadEvent = (gamepadId: string, type: GamepadMappingType, value: number, pressedSuite: number) => {
    const button = getGamepadMapping(gamepadId, type, value);

    if (!button) {
        console.warn('Gamepad mapping not found for:', {
            gamepadId,
            type,
            value,
        });
    }

    const event: GamepadEvent = new CustomEvent(eventType, {
        detail: {
            button,
            pressedSuite,
        },
    });

    window.dispatchEvent(event);
};

export const addGamepadEventListener = (listener: (e: GamepadEvent) => void) => {
    window.addEventListener(eventType, listener as EventListener);

    return () => {
        window.removeEventListener(eventType, listener as EventListener);
    };
};

export const getGamepadPressedButtons = () => {

    const gamepads = navigator.getGamepads();

    return gamepads.flatMap(gp => {
        if (!gp) return [];

        const gamepadId = gp.id;

        return [
            ...gp.axes
                .flatMap(axe => [axe, axe])
                .map((axe, i) => {
                    const pressed = i % 2
                        ? axe >= 1
                        : axe <= -1;

                    return [
                        getGamepadMapping(gamepadId, 'axis', i), 
                        pressed,
                    ] as const;
                }),
            ...gp.buttons.map((button, i) => {
                return [
                    getGamepadMapping(gamepadId, 'button', i), 
                    button.pressed,
                ] as const;
            })
        ];
    })
    .filter(tuple => tuple[1])
    .map(tuple => tuple[0]);
};
