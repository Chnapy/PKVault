import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { getGamepadPressedButtons } from '../controls/gamepad/gamepad-event';
import type { ControlsWithFalsy } from '../controls/provider/controls-context';
import { useControls } from '../controls/use-controls';
import { useFocusNode, type UseFocusNodeParams } from '../focus/node/use-focus-node';
import { Focus } from '../focus/provider/use-focus-context';
import { useFocusScopeContext } from '../focus/scope/use-focus-scope-context';

export type UseFocusControlsParams = UseFocusNodeParams & {
    childScopeId?: string;
    controls: ControlsWithFalsy;
    controlsEnable?: 'ifInScopeStack' | 'always';
};

export const useFocusControls = ({
    scopeNodeId, childScopeId, focusOnMount, onFocus,
    controls, controlsEnable = 'ifInScopeStack'
}: UseFocusControlsParams) => {
    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const focusInChildScope = Focus.useIsInScopeStack(childScopeId);

    const { nodeId, focused, focusProps, ...focusRest } = useFocusNode({
        scopeNodeId,
        focusOnMount,
        onFocus: (layout, props, details) => {
            onFocus?.(layout,props,details);

            // allow multi-select keeping Y pressed over navigate
            const buttons = getGamepadPressedButtons();
            controls.forEach(c => {
                if (!c || !c.triggers.gamepad?.allowOnFocus)
                    return;
                
                const value = c.triggers.gamepad.values.find(v => buttons.includes(v));
                if (value)
                    c.action(details.event as never, 'gamepad', value);
            });
        },
    });

    const getControlsEnable = () => {
        switch (controlsEnable) {
            case 'ifInScopeStack': return focused || focusInChildScope;
            case 'always': return true;
        }
    };

    const {
        onClick: controlOnClick,
        ...controlPropsRest
    } = useControls(
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
        order,
        ...focusRest,
    };
};
