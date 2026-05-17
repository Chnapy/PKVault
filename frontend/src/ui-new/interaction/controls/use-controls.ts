import React from 'react';
import { type ControlAction, type ControlId, type ControlsWithFalsy } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';

type Options = {
    enabled: boolean;
};

type ControlsProps = {
    onClick?: React.MouseEventHandler;
    'data-controls': string;
    'data-controls-order': number;
    'data-controls-enabled'?: boolean;
};

export const useControls = (id: ControlId, focused: boolean, order: number, controls: ControlsWithFalsy, { enabled }: Options): ControlsProps => {
    const { registerControls, unregisterControls } = useControlsContext();

    const controlsRef = React.useRef(controls);

    React.useEffect(() => {
        controlsRef.current = controls;
    }, [ controls ]);

    React.useEffect(() => {
        if (!enabled) return;

        registerControls(
            id,
            controlsRef.current
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
    }, [ enabled, focused, id, order, registerControls, unregisterControls ]);

    const onClick = React.useCallback<React.MouseEventHandler>(() => {
        const clickAction = controlsRef.current.find((c): c is ControlAction =>
            !!c && !!c?.triggers.mouse?.values.includes('left-click')
        )?.action;

        clickAction?.('mouse', 'left-click');
    }, []);

    return {
        onClick,
        'data-controls': controls.map(c => c && c.name).filter(Boolean).join('-'),
        'data-controls-order': order,
        'data-controls-enabled': enabled || undefined,
    };
};
