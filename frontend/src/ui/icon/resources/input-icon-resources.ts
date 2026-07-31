import keyboard from '../../../assets/input_icons/KeyboardMouse/keyboard.svg?react';
import keyEscape from '../../../assets/input_icons/KeyboardMouse/keyboard_escape.svg?react';
import keySpace from '../../../assets/input_icons/KeyboardMouse/keyboard_space.svg?react';
import keyArrows from '../../../assets/input_icons/KeyboardMouse/keyboard_arrows.svg?react';
import keyX from '../../../assets/input_icons/KeyboardMouse/keyboard_x.svg?react';

import mouse from '../../../assets/input_icons/KeyboardMouse/mouse.svg?react';
import mouseLeft from '../../../assets/input_icons/KeyboardMouse/mouse_left.svg?react';
import mouseMove from '../../../assets/input_icons/KeyboardMouse/mouse_move.svg?react';
import mouseRight from '../../../assets/input_icons/KeyboardMouse/mouse_right.svg?react';
import mouseScroll from '../../../assets/input_icons/KeyboardMouse/mouse_scroll_vertical.svg?react';

import steamdeck from '../../../assets/input_icons/SteamDeck/controller_steamdeck.svg?react';
import gpA from '../../../assets/input_icons/SteamDeck/steamdeck_button_a.svg?react';
import gpB from '../../../assets/input_icons/SteamDeck/steamdeck_button_b.svg?react';
import gpL1 from '../../../assets/input_icons/SteamDeck/steamdeck_button_l1.svg?react';
import gpL2 from '../../../assets/input_icons/SteamDeck/steamdeck_button_l2.svg?react';
import gpR1 from '../../../assets/input_icons/SteamDeck/steamdeck_button_r1.svg?react';
import gpR2 from '../../../assets/input_icons/SteamDeck/steamdeck_button_r2.svg?react';
import gpX from '../../../assets/input_icons/SteamDeck/steamdeck_button_x.svg?react';
import gpY from '../../../assets/input_icons/SteamDeck/steamdeck_button_y.svg?react';
import gpDPad from '../../../assets/input_icons/SteamDeck/steamdeck_dpad.svg?react';
import gpDPadDown from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_down.svg?react';
import gpDPadLeft from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_left.svg?react';
import gpDPadRight from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_right.svg?react';
import gpDPadUp from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_up.svg?react';
import gpRStick from '../../../assets/input_icons/SteamDeck/steamdeck_stick_r.svg?react';

import keepPress from '../../../assets/input_icons/Flairs/flair_circle_red_3.svg?react';

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
        scroll: mouseScroll,
    },
    keyboard: {
        escape: keyEscape,
        space: keySpace,
        arrows: keyArrows,
        x: keyX,
    },
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
