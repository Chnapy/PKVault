import { Box, Group, SegmentedControl } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import type { GamepadMappingsAllButton } from '../../interaction/controls/gamepad/gamepad-mapper';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UISegmentedControlProps = SegmentedControl.Props & {
    name: string;
    controlLabel: string;
    focusOnMount?: boolean;
};

const isOptionDisabled = (opt: SegmentedControl.Props[ 'data' ][ number ] | undefined) => typeof opt === 'object' && !!opt.disabled;

export const UISegmentedControl: React.FC<UISegmentedControlProps> = ({ name, controlLabel, focusOnMount, className, style, ...rest }) => {

    const isGamepad = useControlsCurrentType() === 'gamepad';

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            {
                name: 'change' as const,
                label: controlLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'LB', 'RB' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    const options = rest.data ?? [];
                    if (options.every(isOptionDisabled))
                        return;

                    const selectedIndex = options
                        .map(opt => typeof opt === 'object' ? opt.value : opt)
                        .indexOf(rest.value ?? '');
                    let nextIndex = selectedIndex;
                    switch (value as GamepadMappingsAllButton) {
                        case 'LB':
                            do {
                                nextIndex = nextIndex - 1;
                                // if (nextIndex < 0)
                                //     nextIndex = options.length - 1;
                            } while (isOptionDisabled(options[ nextIndex ]));
                            break;
                        case 'RB':
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

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    return <Group
        className={className}
        style={style}
        gap='xs'
        wrap='nowrap'
        align='center'
    >
        {controlsIcons.change?.[ 0 ]
            ?? (isGamepad && <Box w='1lh' />)
        }
        <SegmentedControl
            {...focusControlProps}
            {...rest}
            ref={ref}
            onChange={value => {
                focusControlProps.onChange?.(value as never);
                rest.onChange?.(value);
            }}
            style={{ flexGrow: 1 }}
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
        {controlsIcons.change?.[ 1 ]
            ?? (isGamepad && <Box w='1lh' />)
        }
    </Group>;
};
