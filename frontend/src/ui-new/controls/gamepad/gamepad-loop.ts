import { sendGamepadEvent } from './gamepad-event';
import { type GamepadMappingType } from './gamepad-mapper';

export const gamepadLoop = () => {
    const gamepadStates: GamepadStates = {};

    let id = -1;

    let prevTime = -1;

    const callback: FrameRequestCallback = time => {

        const delta = prevTime < 0
            ? 0
            : (time - prevTime);
        prevTime = time;

        loop(delta, gamepadStates);

        id = requestAnimationFrame(callback);
    };

    id = requestAnimationFrame(callback);

    return () => {
        cancelAnimationFrame(id);
    };
};

type State = {
    type: GamepadMappingType;
    value: number;
    pressed: boolean;
    pressedSuite: number;
    timeStack: number;
};

type GamepadStates = {
    [id in string]?: {
        timeStack: number;
        axes: {
            [value in number]?: State;
        };
        buttons: {
            [value in number]?: State;
        };
    };
};

const secondPressDelay = 400;
const nextPressDelay = 200;

const loop = (delta: number, states: GamepadStates) => {
    // console.log(delta);

    const gamepads = navigator.getGamepads();

    for (const gp of gamepads) {
        if (!gp) continue;

        if (!states[gp.id]) {
            states[gp.id] = {
                timeStack: 0,
                axes: {},
                buttons: {},
            };
        }
        const gpState = states[gp.id]!;
        gpState.timeStack += delta;

        const act = (state: State, pressed: boolean) => {
            if (pressed) {
                state.pressed = true;
                state.timeStack += delta;

                if (state.pressedSuite === 0) {
                    state.pressedSuite++;
                    // trigger
                    sendGamepadEvent(gp.id, state.type, state.value, state.pressedSuite);
                } else {
                    if (state.timeStack - secondPressDelay > nextPressDelay) {
                        state.timeStack = secondPressDelay;
                        state.pressedSuite++;
                        // trigger
                        sendGamepadEvent(gp.id, state.type, state.value, state.pressedSuite);
                    }
                }
            } else {
                state.pressed = false;
                state.pressedSuite = 0;
                state.timeStack = 0;
            }
        };

        gp.axes
            .flatMap(axe => [axe, axe])
            .forEach((axe, i) => {
                if (!gpState.axes[i]) {
                    gpState.axes[i] = {
                        type: 'axis',
                        value: i,
                        pressed: false,
                        pressedSuite: 0,
                        timeStack: 0,
                    };
                }

                const pressed = i % 2
                    ? axe >= 1
                    : axe <= -1;

                act(gpState.axes[i], pressed);
            });

        gp.buttons.forEach((button, i) => {
            if (!gpState.buttons[i]) {
                gpState.buttons[i] = {
                    type: 'button',
                    value: i,
                    pressed: false,
                    pressedSuite: 0,
                    timeStack: 0,
                };
            }
            
            act(gpState.buttons[i], button.pressed);
        });
    }
};
