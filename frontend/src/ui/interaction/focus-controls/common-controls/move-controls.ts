import { getCurrentFocusKey, navigateByDirection, SpatialNavigation } from '@noriginmedia/norigin-spatial-navigation-core';
import type { Vector2 } from '@use-gesture/react';
import type { GamepadMappingsAllButton } from '../../controls/gamepad/gamepad-mapper';
import type { ControlActionInput } from '../../controls/provider/controls-context';

const keyboardValues = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' ] as const;

export const getMoveControl = (partial: Omit<ControlActionInput, 'name' | 'triggers' | 'action' | 'spread'>) => ({
    ...partial,
    name: 'move' as const,
    triggers: {
        mouse: {
            type: 'mouse',
            values: [ 'move' ],
        },
        keyboard: {
            type: 'keyboard',
            values: [...keyboardValues],
            allowPressedSuite: 1,
        },
        gamepad: {
            type: 'gamepad',
            values: [ 'DPadLeft', 'DPadRight', 'DPadUp', 'DPadDown', 'LStickLeft', 'LStickRight', 'LStickUp', 'LStickDown' ],
            allowPressedSuite: 1,
        },
    },
    spread: true,
    action: function (e, state, value) {
        switch (state) {
            case 'keyboard':
            case 'gamepad': {
                const currentKey = getCurrentFocusKey();
                const failDelta = 2;
                const failTransformPos: Vector2 = [ 0, 0 ];

                switch (value as GamepadMappingsAllButton | typeof keyboardValues[number]) {
                    case 'ArrowDown':
                    case 'DPadDown':
                    case 'LStickDown':
                        navigateByDirection('down');
                        failTransformPos[ 1 ] = failDelta;
                        break;
                    case 'ArrowUp':
                    case 'DPadUp':
                    case 'LStickUp':
                        navigateByDirection('up');
                        failTransformPos[ 1 ] = -failDelta;
                        break;
                    case 'ArrowLeft':
                    case 'DPadLeft':
                    case 'LStickLeft':
                        navigateByDirection('left');
                        failTransformPos[ 0 ] = -failDelta;
                        break;
                    case 'ArrowRight':
                    case 'DPadRight':
                    case 'LStickRight':
                        navigateByDirection('right');
                        failTransformPos[ 0 ] = failDelta;
                        break;
                }

                const nextKey = getCurrentFocusKey();
                if (currentKey === nextKey) {
                    const node: HTMLElement | null = SpatialNavigation.getNodeLayoutByFocusKey(currentKey)?.node;
                    if (node) {
                        // console.log('unmoved node', node);
                        delete node.dataset.focusMoveFail;
                        node.style.setProperty('--move-fail-transform', `translate(${failTransformPos[ 0 ]}px, ${failTransformPos[ 1 ]}px)`);
                        void node.offsetWidth;
                        node.dataset.focusMoveFail = 'true';
                    }
                }
                break;
            }
        }
    },
} satisfies ControlActionInput);
