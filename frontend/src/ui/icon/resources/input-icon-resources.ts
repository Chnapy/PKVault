import keyboard from '../../../assets/input_icons/KeyboardMouse/Vector/keyboard.svg?react';
import mouse from '../../../assets/input_icons/KeyboardMouse/Vector/mouse.svg?react';
import mouseLeft from '../../../assets/input_icons/KeyboardMouse/Vector/mouse_left.svg?react';
import mouseMove from '../../../assets/input_icons/KeyboardMouse/Vector/mouse_move.svg?react';
import mouseRight from '../../../assets/input_icons/KeyboardMouse/Vector/mouse_right.svg?react';

import steamdeck from '../../../assets/input_icons/SteamDeck/Vector/controller_steamdeck.svg?react';
import gpA from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_a.svg?react';
import gpB from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_b.svg?react';
import gpL1 from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_l1.svg?react';
import gpL2 from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_l2.svg?react';
import gpR1 from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_r1.svg?react';
import gpR2 from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_r2.svg?react';
import gpX from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_x.svg?react';
import gpY from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_button_y.svg?react';
import gpDPad from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_dpad.svg?react';
import gpDPadDown from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_dpad_down.svg?react';
import gpDPadLeft from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_dpad_left.svg?react';
import gpDPadRight from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_dpad_right.svg?react';
import gpDPadUp from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_dpad_up.svg?react';
import gpRStick from '../../../assets/input_icons/SteamDeck/Vector/steamdeck_stick_r.svg?react';

import keepPress from '../../../assets/input_icons/Flairs/Vector/flair_circle_red_3.svg?react';

import type { ControlTriggerType } from '../../interaction/controls/provider/controls-context';

export type InputIcon = typeof gpA;

export const inputIconResources = {
    type: {
        mouse,
        keyboard,
        gamepad: steamdeck,
    } satisfies Record<ControlTriggerType, unknown>,
    mouse: {
        leftClick: mouseLeft,
        rightClick: mouseRight,
        move: mouseMove,
    },
    keyboard: {},
    gamepad: {
        A: gpA,
        B: gpB,
        X: gpX,
        Y: gpY,
        LB: gpL1,
        RB: gpR1,
        LT: gpL2,
        RT: gpR2,
        DPad: gpDPad,
        DPadUp: gpDPadUp,
        DPadDown: gpDPadDown,
        DPadLeft: gpDPadLeft,
        DPadRight: gpDPadRight,
        RStick: gpRStick,
    },
    misc: {
        keepPress,
    },
};
