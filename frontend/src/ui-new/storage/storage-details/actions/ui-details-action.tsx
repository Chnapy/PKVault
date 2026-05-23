
import { Button, type ElementProps } from '@mantine/core';
import type React from 'react';
import type { GamepadMappingsAllButton } from '../../../interaction/controls/gamepad/gamepad-mapper';
import { getControlIcon } from '../../../interaction/controls/icons/get-control-icon';
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

    const { focusControlProps, order, active } = useFocusControls({
        scopeNodeId: 'details-' + name,
        focusOnMount,
        controls: [
            onClick && getSelectControl({
                label: 'Select',
                action: onClick,
            }),
        ],
    });

    useControls(
        'details-2-' + name,
        true,
        order,
        [
            onClick && getSelectControl({
                label: 'Select',
                action: onClick,
            }),
            onClick && gamepadValue && {
                name: 'details-' + name,
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

    return <Button
        {...rest}
        {...focusControlProps}
        leftSection={icons ?? rest.leftSection}
    >
        {label}
    </Button>;
};
