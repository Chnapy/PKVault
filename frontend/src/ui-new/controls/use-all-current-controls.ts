import React from 'react';
import { useControlsContext } from './provider/use-controls-context';

export const useAllCurrentControls = () => {
    const { controlsRef, controlsState, controlsListeners } = useControlsContext();

    // used to trigger rerender only when needed
    const hash = React.useSyncExternalStore(
        React.useCallback(trigger => {
            controlsListeners.current.add(trigger);
            
            return () => {
                controlsListeners.current.delete(trigger);
            };
        }, [ controlsListeners ]),
        React.useCallback(() => {
            const controlsHash = [ ...controlsRef.current.values() ].flat()
                .filter(c => c.triggers[ controlsState.current ])
                .map(({ triggers, ...c }) => ({
                    ...c,
                    trigger: triggers[ controlsState.current ]!,
                }))
                .map(c => [
                    c.label,
                    c.trigger.type,
                    c.trigger.values.join('.'),
                ].join('.'))
                .sort().join('-');

            return [controlsState.current, controlsHash].join('_');
        }, [controlsRef, controlsState]),
    );

    return React.useCallback(() => {
        hash.toString();
        
        return [ ...controlsRef.current.values() ].flat()
            .filter(c => c.triggers[ controlsState.current ])
            .map(({ triggers, ...c }) => ({
                ...c,
                trigger: triggers[ controlsState.current ]!,
            }));
    }, [hash, controlsRef, controlsState]);
};
