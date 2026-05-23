import React from 'react';
import { addGamepadEventListener } from '../gamepad/gamepad-event';
import { gamepadLoop } from '../gamepad/gamepad-loop';
import { controlsContext, createControlsStore, type ControlsContext, type ControlTriggerType } from './controls-context';

export const ControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ methods ] = React.useState((): ControlsContext => ({
        useControlsStore: createControlsStore(
            navigator.getGamepads().some(v => v) ? 'gamepad' : undefined,
        ),
    }));

    React.useEffect(() => {
        const getState = methods.useControlsStore.getState;
        const setState = methods.useControlsStore.setState;

        const updateState = (state: ControlTriggerType) => setState(s => {
            const currentType = s.currentType;
            if (currentType === state) return s;

            console.info('update controls state', currentType, '->', state);
            return {
                ...s,
                currentType: state,
            };
        });

        // sort & filter based on order + spread
        const getSortedFilteredControls = () => {
            const sortedControls = [ ...getState().controls.values() ].flat()
                .sort((c1, c2) => c2.order - c1.order);

            // currentOrder can be undefined even with focused element
            // if no controls are passed from it
            const currentOrder = sortedControls.find(c => c.focused)?.order;

            return sortedControls.filter(c => c.order === currentOrder || c.spread);
        };

        const keydownListener = (e: KeyboardEvent) => {
            updateState('keyboard');

            for (const control of getSortedFilteredControls()) {
                const listeners = control.triggers.keyboard?.listeners ?? [ 'onKeyDown' ];
                const keys = control.triggers.keyboard?.values ?? [];

                if (listeners.includes('onKeyDown')) {
                    for (const key of keys) {
                        if (e.key === key) {
                            control.action(e as never, getState().currentType, key);
                        }
                    }
                }
            }
        };

        const mouseListener = () => {
            updateState('mouse');
        };

        window.addEventListener('keydown', keydownListener);
        window.addEventListener('mousedown', mouseListener);
        window.addEventListener('mousemove', mouseListener);

        const removeGamepadListener = addGamepadEventListener(e => {
            updateState('gamepad');

            if (e.detail.button) {

                const control = getSortedFilteredControls()
                    // take first control, avoiding conflicts
                    .find(c => c.triggers.gamepad?.values.includes(e.detail.button!)
                        && (e.detail.pressedSuite <= 1 || c.triggers.gamepad.allowPressedSuite)
                    );

                console.info('gamepad pressed', e.detail.button, e.detail.pressedSuite, { control });

                control?.action(e as never, getState().currentType, e.detail.button);
            }
        });

        const cancelGamepadLoop = gamepadLoop();

        return () => {
            cancelGamepadLoop();
            removeGamepadListener();

            window.removeEventListener('mousemove', mouseListener);
            window.removeEventListener('mousedown', mouseListener);
            window.removeEventListener('keydown', keydownListener);
        };
    }, [ methods.useControlsStore ]);

    return <controlsContext.Provider value={methods}>
        {children}
    </controlsContext.Provider>
};
