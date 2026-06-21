import type { ButtonProps } from '@mantine/core';
import React from 'react';
import { removeUndefinedValues } from '../../../util/remove-undefined-values';
import { useMoveContextNullable } from '../move/context/use-move-context';
import { getControlIcon } from './icons/get-control-icon';
import { type ControlId, type ControlListenerAttributes, type ControlsWithFalsy } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';
import { useControlsCurrentType } from './use-controls-current-type';

type Options = {
    enabled: boolean;
};

type ControlsProps = ControlListenerAttributes
    & Pick<ButtonProps, 'disabled'>
    & {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref?: React.RefObject<any>;
        'data-controls': string;
        'data-controls-order': number;
    };

type UseControlsReturn<N extends string = string> = {
    controlProps: (...names: N[]) => ControlsProps;
    controlIcons: (...names: N[]) => React.ReactNode[];
};

export const useControls = <N extends string>(id: ControlId, focused: boolean, order: number, controls: ControlsWithFalsy<N>, { enabled: enabledRaw }: Options): UseControlsReturn<N> => {
    const { useControlsStore } = useControlsContext();

    const dragEndTimestampRef = useMoveContextNullable()?.dragEndTimestampRef;

    const controlsRefs = React.useRef<{ [ name in N ]?: ControlsProps[ 'ref' ] }>({});

    const controlsCurrentType = useControlsCurrentType();

    const filteredRefedControls = React.useMemo(() => controls
        .filter(c => !!c)
        // eslint-disable-next-line react-hooks/refs
        .map(c => {
            const ref: ControlsProps[ 'ref' ] = c.ref ?? controlsRefs.current[ c.name ] ?? { current: null };
            return {
                ...c,
                ref,
            };
        }), [ controls ]);

    const filteredRenamedControls = React.useMemo(() => filteredRefedControls
        .map(c => ({
            ...c,
            name: `${id}--${c.name}`,
            focused,
            order,
        })), [ filteredRefedControls, focused, id, order ]);

    const enabled = enabledRaw && filteredRenamedControls.length > 0;

    React.useEffect(() => {
        controlsRefs.current = {};
        filteredRefedControls.forEach(c => {
            controlsRefs.current[ c.name as N ] = c.ref;
        });
    }, [ filteredRefedControls ]);

    React.useEffect(() => {
        if (!enabled) return;

        const { registerControls, unregisterControls } = useControlsStore.getState();

        registerControls(id, filteredRenamedControls);

        return () => {
            unregisterControls(id);
        };
    }, [ filteredRenamedControls, enabled, id, useControlsStore ]);

    const controlIcons: UseControlsReturn<N>[ 'controlIcons' ] = (...names) => {
        return names.map(name => {
            const item = controls.find(c => c && c.name === name);
            if (!item)
                return;

            if (!enabled)
                return;

            const values = item.triggers[ controlsCurrentType ]?.values ?? [];

            return getControlIcon(controlsCurrentType, values, item.triggers[ controlsCurrentType ]?.allowPressedSuite);
        });
    };

    const controlProps: UseControlsReturn<N>[ 'controlProps' ] = (...names) => {
        const allControls = filteredRefedControls.filter(c => names.includes(c.name));

        if (allControls.length === 0)
            return {
                disabled: true,
                'data-controls': names.join('-'),
                'data-controls-order': order,
            };

        const ref = allControls.sort(c => c.main ? -1 : 0).find(c => c.ref)?.ref;

        const mouseListeners = allControls.flatMap(c => {
            if (!c.triggers.mouse)
                return [];

            const listeners = c.triggers.mouse.listeners ?? [ 'onClick' ];
            const values = c.triggers.mouse.values;

            return listeners.map(name => {
                return [ name, c.action, values ] as const;
            });
        }).reduce<ControlListenerAttributes>((acc, [ name, fn, values ]) => {
            if (!fn)
                return acc;

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

        return removeUndefinedValues({
            ...mouseListeners,
            ref,
            'data-controls': names.join('-'),
            'data-controls-order': order,
        });
    };

    return {
        controlIcons,
        controlProps,
    };
};
