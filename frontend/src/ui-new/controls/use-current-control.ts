import React from 'react';
import type { ControlId } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';

export const useCurrentControl = (controlId: ControlId, actionName: string) => {
    const { controlsRef, controlsState, controlsListeners } = useControlsContext();

    return React.useSyncExternalStore(
        React.useCallback(trigger => {
            const listener = (id?: ControlId) => {
                if (!id || id === controlId) {
                    trigger();
                }
            };

            controlsListeners.current.add(listener);

            return () => {
                controlsListeners.current.delete(listener);
            };
        }, [ controlId, controlsListeners ]),
        React.useCallback(() => {
            const control = controlsRef.current.get(controlId)
                ?.find(c => c.name === actionName && c.triggers[ controlsState.current ]);

            if (!control)
                return;

            const { triggers, ...rest } = control;

            return {
                ...rest,
                trigger: triggers[ controlsState.current ]!,
            };
        }, [ controlId, controlsRef, controlsState, actionName ]),
    );
};
