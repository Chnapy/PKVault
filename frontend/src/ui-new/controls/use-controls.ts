import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { type ControlAction, type ControlId, type ControlsWithFalsy } from './provider/controls-context';
import { useControlsContext } from './provider/use-controls-context';

type Options = {
    enabled: boolean;
};

type ControlsProps = {
    onClick?: React.MouseEventHandler;
};

export const useControls = (id: ControlId, controls: ControlsWithFalsy, { enabled }: Options): ControlsProps => {
    const { registerControls, unregisterControls } = useControlsContext();

    const controlsRef = React.useRef(controls);

    React.useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    React.useEffect(() => {
        if (!enabled) return;

        registerControls(
            id,
            controlsRef.current.filter((c): c is ControlAction => !!c),
        );

        return () => {
            unregisterControls(id);
        };
    }, [ enabled, id, registerControls, unregisterControls ]);

    const onClick = React.useCallback<React.MouseEventHandler>((e) => {
        const getFocusableElement = () => {
            if (!(e.target instanceof HTMLElement)) {
                return;
            }

            if (e.target.dataset.focusKey !== undefined) {
                return e.target;
            }

            return e.target.closest<HTMLElement>('[data-focus-key]');
        };

        const focusableEl = getFocusableElement();

        // required:
        // - avoid propagation to parent focus containers
        // - keep propagation to modal, popover etc
        if (focusableEl?.dataset.focusKey === id) {
            setFocus(id);
            // console.log('focus', id, focusableEl.dataset.focusKey)
            
            const clickAction = controlsRef.current.find((c): c is ControlAction =>
                !!c && !!c?.triggers.mouse?.values.includes('left-click')
            )?.action;

            clickAction?.('mouse', 'left-click');
        }
    }, [ id ]);

    return {
        onClick,
    };
};
