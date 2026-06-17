import { Button, Stack } from '@mantine/core';
import React from 'react';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../interaction/focus-controls/components/popover/hooks/use-popover';
import { useFocusControls } from '../interaction/focus-controls/use-focus-controls';
import { UIPopover, type UIPopoverProps } from './ui-popover';

type UIConfirmPopoverProps = Pick<UIPopoverProps, 'popoverRef' | 'children'> & {
    label: string;
    action?: () => void;
};

export const UIConfirmPopover: React.FC<UIConfirmPopoverProps> = ({ label, action, popoverRef, children }) => {
    return <UIPopover
        popoverRef={popoverRef}
        dropdown={<Dropdown label={label} action={action} />}
    >
        {children}
    </UIPopover>;
};

const Dropdown: React.FC<Pick<UIConfirmPopoverProps, 'label' | 'action'>> = ({ label, action }) => {
    const popover = usePopover()!;

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: `confirm_dropdown`,
        focusOnMount: true,
        controls: [
            getSelectControl({
                label: 'Confirm',
                action: () => {
                    action?.();
                    popover.setOpened(false);
                },
            }),
        ],
    });

    return <Stack>
        {label}

        <WithControlsIcons placement='in' icons={controlsIcons.open}>
            <Button
                {...focusControlProps}
                fullWidth
            >
                Confirm ?
            </Button>
        </WithControlsIcons>
    </Stack>
};
