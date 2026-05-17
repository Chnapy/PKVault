import { navigateByDirection } from '@noriginmedia/norigin-spatial-navigation-core';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';
import type { ControlAction } from '../provider/controls-context';

export const getMoveControl = (partial: Pick<ControlAction, 'label'>): ControlAction => ({
    ...partial,
    name: 'move',
    triggers: {
        keyboard: {
            type: 'keyboard',
            icon: 'MV',
            values: [ 'move' ],
            allowPressedSuite: true,
        },
        gamepad: {
            type: 'gamepad',
            icon: 'D-pad',
            values: [ 'DPadLeft', 'DPadRight', 'DPadUp', 'DPadDown', 'LStickLeft', 'LStickRight', 'LStickUp', 'LStickDown' ],
            allowPressedSuite: true,
        },
    },
    action: function (state, value) {
        switch (state) {
            case 'gamepad':
                switch (value as GamepadMappingsAllButton) {
                    case 'DPadDown':
                    case 'LStickDown':
                        navigateByDirection('down'); break;
                    case 'DPadUp':
                    case 'LStickUp':
                        navigateByDirection('up'); break;
                    case 'DPadLeft':
                    case 'LStickLeft':
                        navigateByDirection('left'); break;
                    case 'DPadRight':
                    case 'LStickRight':
                        navigateByDirection('right'); break;
                }
                break;
            // note: keyboard is handled by default by norigin-spatial-navigation
        }
    },
});
