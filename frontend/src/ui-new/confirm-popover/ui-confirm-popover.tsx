import { Button, getSingleElementChild, Stack } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../interaction/focus-controls/components/popover/hooks/use-popover';
import { PopoverWithControls, type PopoverTargetChildProps } from '../interaction/focus-controls/components/popover/popover-with-controls';
import { useFocusControls } from '../interaction/focus-controls/use-focus-controls';

type UIConfirmPopoverProps = {
    label: string;
    action: () => void;
    children: React.ReactElement;
};

export const UIConfirmPopover: React.FC<UIConfirmPopoverProps> = ({ label, action, children }) => {
    return <PopoverWithControls
        target={<TargetOpenPopover>
            {children}
        </TargetOpenPopover>}
        dropdown={<Dropdown label={label} action={action} />}
    />;
};

const TargetOpenPopover: React.FC<PopoverTargetChildProps & { children: React.ReactElement }> = ({ children, ...rest }) => {
    const setPopover = usePopover()!;

    const child = getSingleElementChild(children);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps = child?.props as any;

    const ref = useMergedRef(
        rest.ref,
        childProps?.ref,
    );

    if (!child) {
        return null;
    }

    return React.cloneElement(child, {
        ...childProps,
        ...rest,
        ref,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
            setPopover(s => ({ opened: !s.opened }));
            childProps.onClick?.(e);
        },
    });
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
                    action();
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
