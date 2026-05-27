import React from 'react';
import { useMoveContextNullable } from '../move/context/use-move-context';
import { getControlIcon } from './icons/get-control-icon';
import { type ControlId, type ControlListenerAttributes, type ControlsWithFalsy } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';
import { useControlsCurrentType } from './use-controls-current-type';

type Options = {
    enabled: boolean;
};

type ControlsProps = ControlListenerAttributes & {
    'data-controls': string;
    'data-controls-order': number;
    'data-controls-enabled'?: boolean;
};

type UseControlsReturn<N extends string = string> = {
    controlsProps: ControlsProps;
    controlsIcons: Record<N, React.ReactNode>;
};

export const useControls = <N extends string>(id: ControlId, focused: boolean, order: number, controls: ControlsWithFalsy<N>, { enabled }: Options): UseControlsReturn<N> => {
    const { useControlsStore } = useControlsContext();

    const dragEndTimestampRef = useMoveContextNullable()?.dragEndTimestampRef;

    const filteredRenamedControls = React.useMemo(() => controls
        .filter(c => !!c)
        .map(c => ({
            ...c,
            name: `${id}--${c.name}`,
            focused,
            order,
        })), [controls, focused, id, order]);

    React.useEffect(() => {
        if (!enabled || filteredRenamedControls.length === 0) return;

        const { registerControls, unregisterControls } = useControlsStore.getState();

        registerControls(id, filteredRenamedControls);

        return () => {
            unregisterControls(id);
        };
    }, [ filteredRenamedControls, enabled, id, useControlsStore ]);

    const listenerList = filteredRenamedControls.flatMap(c => {
        if (!c.triggers.mouse)
            return [];

        const listeners = c.triggers.mouse.listeners ?? [ 'onClick' ];
        const values = c.triggers.mouse.values;

        return listeners.map(name => {
            return [ name, c.action, values ] as const;
        });
    });

    const listeners = listenerList.reduce<ControlListenerAttributes>((acc, [ name, fn, values ]) => {
        const currentFn = acc[ name ];

        type AnyEvent = Parameters<NonNullable<typeof currentFn>>[ 0 ];

        return {
            ...acc,
            [ name ]: (e: AnyEvent) => {
                if (name === 'onClick') {
                    if (dragEndTimestampRef
                        && e.timeStamp - dragEndTimestampRef.current < 50)
                        return;
                }

                currentFn?.(e as never);
                fn(e as never, 'mouse', values[ 0 ]!);
            },
        };
    }, {});

    const controlsCurrentType = useControlsCurrentType();

    const controlsIcons = controls.reduce<Record<N, React.ReactNode>>((acc, item) => {
        if (!item) return acc;
        if (!enabled) return acc;

        if (controlsCurrentType === 'mouse') return acc;

        const values = item.triggers[ controlsCurrentType ]?.values ?? [];
        if (values.length === 0) return acc;

        return {
            ...acc,
            [ item.name ]: getControlIcon(controlsCurrentType, values, item.triggers[ controlsCurrentType ]?.allowPressedSuite),
        };
    }, {} as never);

    const controlsProps = {
        ...listeners,
        'data-controls': controls.map(c => c && c.name).filter(Boolean).join('-'),
        'data-controls-order': order,
        'data-controls-enabled': enabled || undefined,
    };

    return {
        controlsProps,
        controlsIcons,
    };
};
