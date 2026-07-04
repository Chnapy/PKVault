import { Group, SegmentedControl } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { GamepadMappingsAllButton } from '../../interaction/controls/gamepad/gamepad-mapper';
import { getControlIcon } from '../../interaction/controls/icons/get-control-icon';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UISegmentedControlProps<V extends string = string> = SegmentedControl.Props<V> & {
    name: string;
    controlLabel: string;
    focusOnMount?: boolean;
    wrap?: boolean;
    gamepadControls?: [ GamepadMappingsAllButton, GamepadMappingsAllButton ];
};

const isOptionDisabled = (opt: SegmentedControl.Props[ 'data' ][ number ] | undefined) => typeof opt === 'object' && !!opt.disabled;

export const UISegmentedControl = function <V extends string = string>({ name, controlLabel, focusOnMount, wrap, gamepadControls, className, style, ...rest }: UISegmentedControlProps<V>) {

    const tabsRef = React.useRef<HTMLDivElement>(null);

    const isGamepad = useControlsCurrentType() === 'gamepad';

    gamepadControls ??= [ 'LB', 'RB' ];

    const { focusProps, controlProps, focused } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            {
                name: 'change' as const,
                main: true,
                label: controlLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: gamepadControls,
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    const options = rest.data ?? [];
                    if (options.every(isOptionDisabled))
                        return;

                    const selectedIndex = options
                        .map(opt => typeof opt === 'object' ? opt.value : opt)
                        .indexOf(rest.value ?? '' as V);
                    let nextIndex = selectedIndex;
                    switch (value as GamepadMappingsAllButton) {
                        case gamepadControls[ 0 ]:
                            do {
                                nextIndex = nextIndex - 1;
                                // if (nextIndex < 0)
                                //     nextIndex = options.length - 1;
                            } while (isOptionDisabled(options[ nextIndex ]));
                            break;
                        case gamepadControls[ 1 ]:
                            do {
                                nextIndex = nextIndex + 1;
                                // if (nextIndex > options.length - 1)
                                //     nextIndex = 0;
                            } while (isOptionDisabled(options[ nextIndex ]));
                            break;
                    }
                    const nextValue = options[ nextIndex ];
                    if (!nextValue)
                        return;

                    rest.onChange?.(typeof nextValue === 'object'
                        ? nextValue.value
                        : nextValue);
                },
            },
        ],
    });

    React.useEffect(() => {
        const selectedTab = tabsRef.current?.querySelector<HTMLDivElement>('div[data-active="true"]');

        selectedTab?.scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'center',
        });
    }, [ rest.value ]);

    const ref = useMergedRef(
        tabsRef,
        focusProps.ref,
        rest.ref,
    );

    return <Group
        className={className}
        style={style}
        gap='xs'
        wrap='nowrap'
        align='center'
    >
        {isGamepad && !rest.disabled
            ? focused && getControlIcon('gamepad', [ gamepadControls[ 0 ] ]) || <span />
            : undefined}
        <SegmentedControl
            {...focusProps}
            {...controlProps('change')}
            {...rest}
            ref={ref}
            onChange={value => {
                controlProps('change').onChange?.(value as never);
                rest.onChange?.(value);
            }}
            style={{
                flexGrow: 1,
                flexWrap: wrap ? 'wrap' : undefined,
                maxHeight: 90,
                overflow: 'auto',
            }}
            styles={{
                label: {
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                innerLabel: {
                    display: 'inline-flex',
                },
            }}
        />
        {isGamepad && !rest.disabled
            ? focused && getControlIcon('gamepad', [ gamepadControls[ 1 ] ]) || <span />
            : undefined}
    </Group>;
};
