import { getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { addGamepadEventListener } from '../gamepad/gamepad-event';
import { gamepadLoop } from '../gamepad/gamepad-loop';
import { controlsContext, type ControlId, type Controls, type ControlsContext, type ControlTriggerType } from './controls-context';

export const ControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const controlsRef = React.useRef(new Map<ControlId, Controls>());
    const controlsState = React.useRef<ControlTriggerType>('mouse');
    const controlsListeners = React.useRef<Set<(id?: ControlId) => void>>(new Set());

    const methods = React.useMemo((): ControlsContext => ({
        controlsRef,
        controlsState,
        controlsListeners,
        registerControls: (id: ControlId, controls: Controls) => {
            controlsRef.current.set(id, controls);
            controlsListeners.current.forEach(l => l(id));
        },
        unregisterControls: (id: ControlId) => {
            controlsRef.current.delete(id);
            controlsListeners.current.forEach(l => l(id));
        },
    }), []);

    React.useEffect(() => {
        const updateState = (state: ControlTriggerType) => {
            if (controlsState.current === state) return;
            console.log('update', controlsState.current, '->', state)
            controlsState.current = state;
            controlsListeners.current.forEach(l => l());
        };

        const focusIfNone = () => {
            if (!getCurrentFocusKey()) {
                const focusableEl = document.querySelector<HTMLElement>('[data-focus-key]');
                setFocus(focusableEl!.dataset.focusKey!);
            }
        };

        const keydownListener = (e: KeyboardEvent) => {
            updateState('keyboard');

            for (const control of [ ...controlsRef.current.values() ].flat()) {
                const keys = control.triggers.keyboard?.values ?? [];

                for (const key of keys) {
                    if (e.key === key) {
                        control.action(controlsState.current, key);
                    }
                }
            }

            focusIfNone();
        };

        window.addEventListener('keydown', keydownListener);

        const removeGamepadListener = addGamepadEventListener(e => {
            updateState('gamepad');

            if (e.detail.button) {

                console.log('pressed', e.detail.button, e.detail.pressedSuite);

                const control = [ ...controlsRef.current.values() ].flat()
                    // take first control, avoiding conflicts
                    .find(c => c.triggers.gamepad?.values.includes(e.detail.button!)
                        && (e.detail.pressedSuite <= 1 || c.triggers.gamepad.allowPressedSuite)
                    );

                control?.action(controlsState.current, e.detail.button);
            }

            focusIfNone();
        });

        const cancelGamepadLoop = gamepadLoop();

        return () => {
            cancelGamepadLoop();
            removeGamepadListener();

            window.removeEventListener('keydown', keydownListener);
        };
    }, []);

    return <controlsContext.Provider value={methods}>
        {children}
    </controlsContext.Provider>
};
