import React from 'react';
import type { PopoverContext } from '../interaction/focus-controls/components/popover/context/popover-context';
import { MenuWithControls, type MenuWithControlsProps } from '../interaction/focus-controls/components/popover/menu-with-controls';
import { TargetOpenPopover } from './target-open-popover';

export type UIMenuProps = {
    popoverRef?: React.RefObject<PopoverContext[ 'setOpened' ] | null>;
    dropdown: React.ReactNode;
    children: React.ReactElement;
} & Omit<MenuWithControlsProps, 'target' | keyof PopoverContext>;

export const UIMenu: React.FC<UIMenuProps> = ({ popoverRef, dropdown, children, ...rest }) => {
    return <MenuWithControls
        target={<TargetOpenPopover popoverRef={popoverRef}>
            {children}
        </TargetOpenPopover>}
        dropdown={dropdown}
        {...rest}
    />;
};
