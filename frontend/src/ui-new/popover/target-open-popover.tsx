import { getSingleElementChild } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import type { PopoverContext } from '../interaction/focus-controls/components/popover/context/popover-context';
import { usePopover } from '../interaction/focus-controls/components/popover/hooks/use-popover';

// @see https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/components/Popover/PopoverTarget/PopoverTarget.tsx
export type PopoverTargetChildProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref?: React.Ref<any>;
    id?: string;
    onClick?: React.MouseEventHandler;
    'aria-haspopup'?: boolean;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
};

export type TargetOpenPopoverProps = PopoverTargetChildProps & {
    popoverRef?: React.RefObject<PopoverContext[ 'setOpened' ] | null>;
    children: React.ReactElement;
};

export const TargetOpenPopover: React.FC<TargetOpenPopoverProps> = ({ popoverRef, children, ...rest }) => {
    const { setOpened } = usePopover()!;

    const child = getSingleElementChild(children);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps = child?.props as any;

    const ref = useMergedRef(
        rest.ref,
        childProps?.ref,
    );

    React.useEffect(() => {
        if (popoverRef)
            popoverRef.current = setOpened;
    }, [ popoverRef, setOpened ]);

    if (!child) {
        return null;
    }

    const disabled = !!childProps.disabled || !!childProps.loading;

    const onClick = disabled
        ? undefined
        : ((e: React.MouseEvent<HTMLElement>) => {
            setOpened(opened => !opened);
            childProps.onClick?.(e);
        });

    return React.cloneElement(child, {
        ...childProps,
        ...rest,
        ref,
        onClick,
    });
};
