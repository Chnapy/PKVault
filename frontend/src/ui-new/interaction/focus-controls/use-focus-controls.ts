import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import type { ControlsWithFalsy } from '../controls/provider/controls-context';
import { useControls } from '../controls/use-controls';
import { useFocusNode } from '../focus/node/use-focus-node';
import { Focus } from '../focus/provider/use-focus-context';
import { useFocusScopeContext } from '../focus/scope/use-focus-scope-context';

type Params = {
    scopeNodeId: string;
    childScopeId?: string;
    focusOnMount?: boolean;
    controls: ControlsWithFalsy;
    controlsEnable?: 'ifInScopeStack' | 'always';
};

export const useFocusControls = <E extends HTMLElement>({
    scopeNodeId, childScopeId, focusOnMount,
    controls, controlsEnable = 'ifInScopeStack'
}: Params) => {
    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const focusInChildScope = Focus.useIsInScopeStack(childScopeId);

    const { nodeId, focused, focusProps, ...focusRest } = useFocusNode<E>({
        scopeNodeId,
        focusOnMount,
    });

    const getControlsEnable = () => {
        switch (controlsEnable) {
            case 'ifInScopeStack': return focused || focusInChildScope;
            case 'always': return true;
        }
    };

    const { onClick: controlOnClick, ...controlPropsRest } = useControls(
        nodeId,
        focused,
        order,
        controls,
        {
            enabled: getControlsEnable(),
        }
    );

    const onClick: typeof controlOnClick = React.useCallback<React.MouseEventHandler>((e) => {
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
        if (focusableEl?.dataset.focusKey === nodeId) {
            setFocus(nodeId);
            // console.log('focus', id, focusableEl.dataset.focusKey)

            controlOnClick?.(e);
        }
    }, [ nodeId, controlOnClick ]);

    const focusControlProps = {
        ...focusProps,
        ...controlPropsRest,
        onClick,
    };

    return {
        focusControlProps,
        nodeId,
        focused,
        ...focusRest,
    };
};
