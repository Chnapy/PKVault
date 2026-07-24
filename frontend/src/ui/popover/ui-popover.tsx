import React from 'react';
import type { PopoverContext } from '../interaction/focus-controls/components/popover/context/popover-context';
import { PopoverWithControls, type PopoverWithControlsProps } from '../interaction/focus-controls/components/popover/popover-with-controls';
import { TargetOpenPopover } from './target-open-popover';

export type UIPopoverProps = {
    popoverRef?: React.RefObject<PopoverContext[ 'setOpened' ] | null>;
    dropdown: React.ReactNode;
    children: React.ReactElement;
} & Omit<PopoverWithControlsProps, 'target' | keyof PopoverContext>;

export const UIPopover: React.FC<UIPopoverProps> = ({ popoverRef, dropdown, children, ...rest }) => {
    return <PopoverWithControls
        target={<TargetOpenPopover popoverRef={popoverRef}>
            {children}
        </TargetOpenPopover>}
        dropdown={dropdown}
        {...rest}
    />;
};
