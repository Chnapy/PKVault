import { NativeSelect } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import type { GamepadMappingsAllButton } from '../../interaction/controls/gamepad/gamepad-mapper';
import { getControlIcon } from '../../interaction/controls/icons/get-control-icon';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UISelectProps = {
    name: string;
    controlLabel: string;
} & NativeSelect.Props;

export const UISelect: React.FC<UISelectProps> = ({ name, controlLabel, data, ...rest }) => {

    const isGamepad = useControlsCurrentType() === 'gamepad';

    const { focusProps, focused, controlProps } = useFocusControls<HTMLSelectElement, 'change'>({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            !rest.disabled && {
                name: 'change',
                main: true,
                label: controlLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'LB', 'RB' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    const options = focusProps.ref.current.options;
                    const selectedIndex = options.selectedIndex;
                    let nextIndex = -1;
                    switch (value as GamepadMappingsAllButton) {
                        case 'LB':
                            nextIndex = selectedIndex - 1;
                            if (nextIndex < 0)
                                nextIndex = options.length - 1;
                            break;
                        case 'RB':
                            nextIndex = selectedIndex + 1;
                            if (nextIndex > options.length - 1)
                                nextIndex = 0;
                            break;
                    }
                    options.selectedIndex = nextIndex;
                    rest.onChange?.({
                        currentTarget: focusProps.ref.current,
                        target: focusProps.ref.current,
                    } as never);
                },
            },
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    return <NativeSelect
        name={name}
        data={data}
        {...focusProps}
        {...controlProps('change')}
        leftSection={isGamepad && !rest.disabled
            ? focused && getControlIcon('gamepad', [ 'LB' ]) || <span />
            : undefined}
        rightSection={isGamepad && !rest.disabled
            ? focused && getControlIcon('gamepad', [ 'RB' ]) || <span />
            : undefined}
        styles={{
            input: isGamepad ? {
                textAlign: 'center',
            } : undefined,
        }}
        {...rest}
        ref={ref}
    />;
};
