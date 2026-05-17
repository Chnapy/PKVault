import React from 'react';
import type { ControlAction, ControlId, ControlTrigger } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';

type CurrentControlAction = Omit<ControlAction, 'triggers'> & {
    trigger: ControlTrigger;
};

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
                .map(({ triggers, ...c }): CurrentControlAction => ({
                    ...c,
                    trigger: triggers[ controlsState.current ]!,
                }))
                .map(c => [
                    c.name,
                    c.order,
                    c.label,
                    c.trigger.type,
                    c.trigger.values.join('.'),
                ].join('.'))
                .sort().join('-');

            return [ controlsState.current, controlsHash ].join('_');
        }, [ controlsRef, controlsState ]),
    );

    return React.useCallback(() => {
        hash.toString();

        return [ ...controlsRef.current.entries() ]
            .sort((entry1, entry2) => {
                const order1 = entry1[ 1 ]?.[ 0 ]?.order;
                const order2 = entry2[ 1 ]?.[ 0 ]?.order;

                if (order1 === undefined || order2 === undefined)
                    return 0;
                return order2 - order1;
            })
            .map(([ controlId, controls ]) => [
                controlId,
                controls.filter(c => c.focused || c.spread),
            ] as const)
            .reduce<Record<ControlId, CurrentControlAction[]>>((acc, [ controlId, controls ]) => {

                const accControls = Object.values(acc).flat();
                const currentControls = controls
                    .filter(c => c.triggers[ controlsState.current ])
                    .map(({ triggers, ...c }): CurrentControlAction => ({
                        ...c,
                        trigger: triggers[ controlsState.current ]!,
                    }));

                const controlsFiltered = currentControls.filter(c1 => !accControls.some(c2 =>
                    c1.trigger.values.join() === c2.trigger.values.join()));

                return controlsFiltered.length > 0
                    ? {
                        ...acc,
                        [ controlId ]: controlsFiltered
                    }
                    : acc;
            }, {});
    }, [ hash, controlsRef, controlsState ]);
};
