import { Button, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UIButtonProps = {
    name: string;
    controlLabel: string;
} & Button.Props & ElementProps<'button'>;

export const UIButton: React.FC<UIButtonProps> = ({ name, controlLabel, onClick, ...rest }) => {

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            getSelectControl({
                label: controlLabel,
                action: (e) => {
                    onClick?.(e);
                },
            }),
        ],
    });

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={controlsIcons.open} display='inline-flex' h='fit-content'>
        <Button
            {...focusControlProps}
            {...rest}
            ref={ref}
            w='100%'
        />
    </WithControlsIcons>;
};
