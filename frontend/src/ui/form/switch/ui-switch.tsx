import { Switch } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UISwitchProps = {
    name: string;
    controlLabel: string;
} & Switch.Props;

export const UISwitch: React.FC<UISwitchProps> = ({ name, controlLabel, ...rest }) => {

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            getSelectControl({
                label: controlLabel,
            }),
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('open')} display='inline-flex' h='fit-content'>
        <Switch
            id={name}
            name={name}
            {...focusProps}
            {...controlProps('open')}
            {...rest}
            ref={ref}
        />
    </WithControlsIcons>;
};
