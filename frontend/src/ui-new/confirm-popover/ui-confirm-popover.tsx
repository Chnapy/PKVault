import { Button, Stack } from '@mantine/core';
import React from 'react';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../interaction/focus-controls/components/popover/hooks/use-popover';
import { useFocusControls } from '../interaction/focus-controls/use-focus-controls';
import { UIPopover } from './ui-popover';

type UIConfirmPopoverProps = {
    label: string;
    action?: () => void;
    children: React.ReactElement;
};

export const UIConfirmPopover: React.FC<UIConfirmPopoverProps> = ({ label, action, children }) => {
    return <UIPopover
        dropdown={<Dropdown label={label} action={action} />}
    >
        {children}
    </UIPopover>;
};

const Dropdown: React.FC<Pick<UIConfirmPopoverProps, 'label' | 'action'>> = ({ label, action }) => {
    const setPopover = usePopover()!;

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: `confirm_dropdown`,
        focusOnMount: true,
        controls: [
            getSelectControl({
                label: 'Confirm',
                action: () => {
                    action?.();
                    setPopover!(() => ({
                        opened: false,
                    }));
                },
            }),
        ],
    });

    return <Stack>
        {label}

        <WithControlsIcons placement='in' icons={controlsIcons.open}>
            <Button
                {...focusControlProps}
            >
                Confirm ?
            </Button>
        </WithControlsIcons>
    </Stack>
};
