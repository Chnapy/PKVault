import React from 'react';
import type { PopoverContext } from '../interaction/focus-controls/components/popover/context/popover-context';
import { DrawerWithControls, type DrawerWithControlsProps } from '../interaction/focus-controls/components/popover/drawer-with-controls';
import { TargetOpenPopover } from './target-open-popover';

export type UIDrawerProps = {
    popoverRef?: React.RefObject<PopoverContext[ 'setOpened' ] | null>;
    dropdown: React.ReactNode;
    children: React.ReactElement;
} & Omit<DrawerWithControlsProps, 'target' | keyof PopoverContext>;

export const UIDrawer: React.FC<UIDrawerProps> = ({ popoverRef, dropdown, children, ...rest }) => {
    return <DrawerWithControls
        target={<TargetOpenPopover popoverRef={popoverRef}>
            {children}
        </TargetOpenPopover>}
        dropdown={dropdown}
        {...rest}
    />;
};
