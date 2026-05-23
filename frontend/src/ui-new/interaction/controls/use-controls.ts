import React from 'react';
import { useMoveContextNullable } from '../move/context/use-move-context';
import { type ControlId, type ControlListenerAttributes, type ControlsWithFalsy } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';

type Options = {
    enabled: boolean;
};

type ControlsProps = ControlListenerAttributes & {
    'data-controls': string;
    'data-controls-order': number;
    'data-controls-enabled'?: boolean;
};

export const useControls = (id: ControlId, focused: boolean, order: number, controls: ControlsWithFalsy, { enabled }: Options): ControlsProps => {
    const { useControlsStore } = useControlsContext();

    const dragEndTimestampRef = useMoveContextNullable()?.dragEndTimestampRef;

    React.useEffect(() => {
        if (!enabled) return;

        const { registerControls, unregisterControls } = useControlsStore.getState();

        registerControls(
            id,
            controls
                .filter(c => !!c)
                .map(c => ({
                    ...c,
                    focused,
                    order,
                })),
        );

        return () => {
            unregisterControls(id);
        };
    }, [controls, enabled, focused, id, order, useControlsStore]);

    const listenerList = controls.flatMap(c => {
        if (!c || !c.triggers.mouse)
            return [];
        
        const listeners = c.triggers.mouse.listeners ?? ['onClick'];
        const values = c.triggers.mouse.values;

        return listeners.map(name => {
            return [name, c.action, values] as const;
        });
    });

    const listeners = listenerList.reduce<ControlListenerAttributes>((acc, [name, fn, values]) => {
        const currentFn = acc[name];

        type AnyEvent = Parameters<NonNullable<typeof currentFn>>[0];

        return {
            ...acc,
            [name]: (e: AnyEvent) => {
                if (name === 'onClick') {
                    if (dragEndTimestampRef
                        && e.timeStamp - dragEndTimestampRef.current < 50)
                        return;
                }

                currentFn?.(e as never);
                fn(e as never, 'mouse', values[0]!);
            },
        };
    }, {});

    return {
        ...listeners,
        'data-controls': controls.map(c => c && c.name).filter(Boolean).join('-'),
        'data-controls-order': order,
        'data-controls-enabled': enabled || undefined,
    };
};
