import { getSingleElementChild } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { usePopover, type UsePopoverValue } from '../interaction/focus-controls/components/popover/hooks/use-popover';
import { PopoverWithControls, type PopoverTargetChildProps } from '../interaction/focus-controls/components/popover/popover-with-controls';

type UIPopoverProps = {
    popoverRef?: React.RefObject<UsePopoverValue>;
    dropdown: React.ReactNode;
    children: React.ReactElement;
};

export const UIPopover: React.FC<UIPopoverProps> = ({ popoverRef, dropdown, children }) => {
    return <PopoverWithControls
        target={<TargetOpenPopover popoverRef={popoverRef}>
            {children}
        </TargetOpenPopover>}
        dropdown={dropdown}
    />;
};

const TargetOpenPopover: React.FC<PopoverTargetChildProps & Pick<UIPopoverProps, 'popoverRef' | 'children'>> = ({ popoverRef, children, ...rest }) => {
    const setPopover = usePopover()!;

    const child = getSingleElementChild(children);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps = child?.props as any;

    const ref = useMergedRef(
        rest.ref,
        childProps?.ref,
    );

    React.useEffect(() => {
        if (popoverRef)
            popoverRef.current = setPopover;
    }, [ popoverRef, setPopover ]);

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
