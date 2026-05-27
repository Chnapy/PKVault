
import { Button, type ElementProps } from '@mantine/core';
import type React from 'react';
import type { GamepadMappingsAllButton } from '../../../interaction/controls/gamepad/gamepad-mapper';
import { getControlIcon } from '../../../interaction/controls/icons/get-control-icon';
import { WithControlsIcons } from '../../../interaction/controls/icons/with-controls-icons';
import { useControls } from '../../../interaction/controls/use-controls';
import { useControlsCurrentType } from '../../../interaction/controls/use-controls-current-type';
import { getSelectControl } from '../../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../../interaction/focus-controls/use-focus-controls';

type UIDetailsActionProps = {
    name: string;
    label: string;
    gamepadValue?: GamepadMappingsAllButton;
    focusOnMount?: boolean;
} & Button.Props & ElementProps<'button'>;

export const UIDetailsAction: React.FC<UIDetailsActionProps> = ({ name, label, gamepadValue, focusOnMount, onClick, ...rest }) => {

    const { focusControlProps, order, active, controlsIcons } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            onClick && getSelectControl({
                label: 'Select',
                action: onClick,
            }),
        ],
    });

    const controls = useControls(
        name + '-active',
        true,
        order,
        [
            onClick && gamepadValue && {
                name: 'active-action',
                label,
                triggers: {
                    // keyboard: {
                    //     type: 'keyboard',
                    //     values: [],
                    // },
                    gamepad: {
                        type: 'gamepad',
                        values: [ gamepadValue ],
                    },
                },
                spread: true,
                action: onClick,
            }
        ],
        { enabled: active },
    );

    const controlsCurrentType = useControlsCurrentType();

    const icons = gamepadValue && getControlIcon(controlsCurrentType, [ gamepadValue ]);

    return <WithControlsIcons placement='out' icons={[
        controlsIcons.open,
        controls.controlsIcons[ 'active-action' ]
    ]}>
        <Button
            {...rest}
            {...focusControlProps}
            leftSection={icons ?? rest.leftSection}
        >
            {label}
        </Button>
    </WithControlsIcons>;
};
