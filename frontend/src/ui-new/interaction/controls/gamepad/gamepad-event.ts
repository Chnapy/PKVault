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
