import { Switch } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UISwitchProps = {
    name: string;
    controlLabel: string;
} & Switch.Props;

export const UISwitch: React.FC<UISwitchProps> = ({ name, controlLabel, ...rest }) => {

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            getSelectControl({
                label: controlLabel,
                action: () => {
                    focusControlProps.ref.current.click();
                },
            }),
        ],
    });

    return <WithControlsIcons placement='out' icons={controlsIcons.open} display='inline-flex' h='fit-content'>
        <Switch
            id={name}
            {...focusControlProps}
            {...rest}
        />
    </WithControlsIcons>;
};
