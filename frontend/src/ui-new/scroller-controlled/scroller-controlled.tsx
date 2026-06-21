import { Box, Scroller } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { GamepadMappingsAllButton } from '../interaction/controls/gamepad/gamepad-mapper';
import { getControlIcon } from '../interaction/controls/icons/get-control-icon';
import { useControls } from '../interaction/controls/use-controls';
import { useControlsCurrentType } from '../interaction/controls/use-controls-current-type';
import { Focus } from '../interaction/focus/provider/use-focus-context';
import { useFocusScopeContext } from '../interaction/focus/scope/use-focus-scope-context';
import classes from './scroller-controlled.module.css';

export type ScrollerControlledProps = {
    id: string;
    level: 1 | 2;
    controlsEnabled: boolean;
    controlsLabel: string;
} & Scroller.Props;

export const ScrollerControlled: React.FC<ScrollerControlledProps> = ({ id, level, controlsEnabled, controlsLabel, ...rest }) => {
    const refInner = React.useRef<HTMLDivElement>(null);

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const enabled = Focus.useIsScopeActive(parentScope.scopeId) && controlsEnabled;

    const isGamepad = useControlsCurrentType() === 'gamepad';

    // console.log('scroller', id, parentScope);

    const gamepadValues: [ GamepadMappingsAllButton, GamepadMappingsAllButton ] = level === 1
        ? [ 'LB', 'RB' ]
        : [ 'LT', 'RT' ];

    const tabsName = 'tabs-' + id;

    const { controlProps } = useControls(
        id,
        true,
        order,
        [
            {
                name: tabsName,
                label: controlsLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: gamepadValues,
                        // allowPressedSuite: true,
                        // TODO keep pressing should open detailed view
                    },
                },
                spread: false,
                action: (e, trigger, value) => {
                    console.log('trigger', id, level, value, parentScope);

                    const tabs = [ ...refInner.current?.querySelectorAll<HTMLElement>('[role="tab"]:not([data-disabled="true"])') ?? [] ];
                    let nextIndex = 0;

                    const selectedIndex = [ ...tabs ].findIndex(tab => tab.dataset.active === 'true');

                    if (selectedIndex > -1) {
                        switch (value as GamepadMappingsAllButton) {
                            case gamepadValues[ 0 ]:
                                nextIndex = selectedIndex - 1;
                                break;
                            case gamepadValues[ 1 ]:
                                nextIndex = selectedIndex + 1;
                                break;
                        }
                    }

                    tabs[ nextIndex ]?.focus();
                    tabs[ nextIndex ]?.click();
                },
            }
        ],
        { enabled },
    );

    const showGamepadIcons = isGamepad && enabled;

    const icons = showGamepadIcons
        ? getControlIcon('gamepad', gamepadValues).map((icon, i) => <Box
            key={i}
            display='inline-flex'
            opacity={0.5}
        >
            {icon}
        </Box>)
        : [];

    const ref = useMergedRef(
        refInner,
        controlProps(tabsName).ref,
        rest.ref,
    );

    return <Scroller
        startControlIcon={icons[ 0 ]}
        endControlIcon={icons[ 1 ]}
        showStartControl={showGamepadIcons}
        showEndControl={showGamepadIcons}
        controlSize='1lh'
        {...controlProps(tabsName)}
        {...rest}
        ref={ref}
        classNames={{
            container: classes.container,
            content: classes.content,
            control: classes.control,
        }}
    />;
};
