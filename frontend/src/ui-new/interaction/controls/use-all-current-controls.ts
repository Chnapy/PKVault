import React from 'react';
import type { ControlAction, ControlId, ControlTrigger } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';

type CurrentControlAction = Omit<ControlAction, 'triggers'> & {
    trigger: ControlTrigger;
};

export const useAllCurrentControls = () => {
    const { useControlsStore } = useControlsContext();
    
    const controls = useControlsStore(s => s.controls);
    const currentType = useControlsStore(s => s.currentType);

    return React.useMemo(() => [ ...controls.entries() ]
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
                .filter(c => c.triggers[ currentType ])
                .map(({ triggers, ...c }): CurrentControlAction => ({
                    ...c,
                    trigger: triggers[ currentType ]!,
                }));

            const controlsFiltered = currentControls.filter(c1 => !accControls.some(c2 =>
                c1.trigger.values.join() === c2.trigger.values.join()));

            return controlsFiltered.length > 0
                ? {
                    ...acc,
                    [ controlId ]: controlsFiltered
                }
                : acc;
        }, {}),
        [controls, currentType]
    );
};
