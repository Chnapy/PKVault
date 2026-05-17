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
            console.info('update controls state', controlsState.current, '->', state);
            controlsState.current = state;
            controlsListeners.current.forEach(l => l());
        };

        // sort & filter based on order + spread
        const getSortedFilteredControls = () => {
            const sortedControls = [ ...controlsRef.current.values() ].flat()
                .sort((c1, c2) => c2.order - c1.order);

            // currentOrder can be undefined even with focused element
            // if no controls are passed from it
            const currentOrder = sortedControls.find(c => c.focused)?.order;

            return sortedControls.filter(c => c.order === currentOrder || c.spread);
        };

        const keydownListener = (e: KeyboardEvent) => {
            updateState('keyboard');

            for (const control of getSortedFilteredControls()) {
                const keys = control.triggers.keyboard?.values ?? [];

                for (const key of keys) {
                    if (e.key === key) {
                        control.action(controlsState.current, key);
                    }
                }
            }
        };

        window.addEventListener('keydown', keydownListener);

        const removeGamepadListener = addGamepadEventListener(e => {
            updateState('gamepad');

            if (e.detail.button) {

                const control = getSortedFilteredControls()
                    // take first control, avoiding conflicts
                    .find(c => c.triggers.gamepad?.values.includes(e.detail.button!)
                        && (e.detail.pressedSuite <= 1 || c.triggers.gamepad.allowPressedSuite)
                    );

                console.info('gamepad pressed', e.detail.button, e.detail.pressedSuite, { control });

                control?.action(controlsState.current, e.detail.button);
            }
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
