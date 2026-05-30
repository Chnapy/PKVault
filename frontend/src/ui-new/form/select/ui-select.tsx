import { NativeSelect } from '@mantine/core';
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

    const { focusControlProps, focused } = useFocusControls<HTMLSelectElement>({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            {
                name: name + '-change',
                label: controlLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'LB', 'RB' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    const options = focusControlProps.ref.current.options;
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
                },
            },
        ],
    });

    return <NativeSelect
        data={data}
        {...focusControlProps}
        leftSection={isGamepad
            ? focused && getControlIcon('gamepad', [ 'LB' ]) || <span />
            : undefined}
        rightSection={isGamepad
            ? focused && getControlIcon('gamepad', [ 'RB' ]) || <span />
            : undefined}
        styles={{
            input: isGamepad ? {
                textAlign: 'center',
            } : undefined,
        }}
        {...rest}
    />;
};
