import keyboard from '../../../assets/input_icons/KeyboardMouse/keyboard.svg?raw';
import keyArrows from '../../../assets/input_icons/KeyboardMouse/keyboard_arrows.svg?raw';
import keyEscape from '../../../assets/input_icons/KeyboardMouse/keyboard_escape.svg?raw';
import keySpace from '../../../assets/input_icons/KeyboardMouse/keyboard_space.svg?raw';
import keyX from '../../../assets/input_icons/KeyboardMouse/keyboard_x.svg?raw';

import mouse from '../../../assets/input_icons/KeyboardMouse/mouse.svg?raw';
import mouseLeft from '../../../assets/input_icons/KeyboardMouse/mouse_left.svg?raw';
import mouseMove from '../../../assets/input_icons/KeyboardMouse/mouse_move.svg?raw';
import mouseRight from '../../../assets/input_icons/KeyboardMouse/mouse_right.svg?raw';
import mouseScroll from '../../../assets/input_icons/KeyboardMouse/mouse_scroll_vertical.svg?raw';

import steamdeck from '../../../assets/input_icons/SteamDeck/controller_steamdeck.svg?raw';
import gpA from '../../../assets/input_icons/SteamDeck/steamdeck_button_a.svg?raw';
import gpB from '../../../assets/input_icons/SteamDeck/steamdeck_button_b.svg?raw';
import gpL1 from '../../../assets/input_icons/SteamDeck/steamdeck_button_l1.svg?raw';
import gpL2 from '../../../assets/input_icons/SteamDeck/steamdeck_button_l2.svg?raw';
import gpR1 from '../../../assets/input_icons/SteamDeck/steamdeck_button_r1.svg?raw';
import gpR2 from '../../../assets/input_icons/SteamDeck/steamdeck_button_r2.svg?raw';
import gpX from '../../../assets/input_icons/SteamDeck/steamdeck_button_x.svg?raw';
import gpY from '../../../assets/input_icons/SteamDeck/steamdeck_button_y.svg?raw';
import gpDPad from '../../../assets/input_icons/SteamDeck/steamdeck_dpad.svg?raw';
import gpDPadDown from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_down.svg?raw';
import gpDPadLeft from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_left.svg?raw';
import gpDPadRight from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_right.svg?raw';
import gpDPadUp from '../../../assets/input_icons/SteamDeck/steamdeck_dpad_up.svg?raw';
import gpRStick from '../../../assets/input_icons/SteamDeck/steamdeck_stick_r.svg?raw';

import keepPress from '../../../assets/input_icons/Flairs/flair_circle_red_3.svg?raw';

import type { ControlTriggerType } from '../../interaction/controls/provider/controls-context';

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
