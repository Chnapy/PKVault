import { Switch } from '@mantine/core';
import type React from 'react';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UISwitchProps = {
    name: string;
    controlLabel: string;
} & Switch.Props;

export const UISwitch: React.FC<UISwitchProps> = ({ name, controlLabel, ...rest }) => {

    const { focusControlProps, focused } = useFocusControls<HTMLInputElement>({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            {
                name: name + '-change',
                label: controlLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'A' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    focusControlProps.ref.current.click();
                },
            },
        ],
    });

    return <Switch
        id={name}
        {...focusControlProps}
        {...rest}
    />;
};
