import { Drawer, Popover, type DrawerProps } from '@mantine/core';
import React from 'react';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { popoverContext, type PopoverContext } from './context/popover-context';
import { PopoverDropdownWithControls } from './popover-dropdown-with-controls';

export type DrawerWithControlsProps = Partial<PopoverContext> & {
    target: React.ReactElement;
    dropdown: React.ReactNode;
    dropdownProps?: Popover.Dropdown.Props;
    focusOnMount?: boolean;
    nested?: boolean;
} & Omit<DrawerProps, 'opened' | 'withinPortal' | 'onClose'>;

export const DrawerWithControls: React.FC<DrawerWithControlsProps> = ({ opened, setOpened, target, dropdown, dropdownProps, focusOnMount, nested, ...rest }) => {
    const [ innerOpened, setInnerOpened ] = React.useState(false);

    const ctx = React.useMemo((): PopoverContext => opened !== undefined && setOpened
        ? { opened, setOpened }
        : {
            opened: innerOpened,
            setOpened: setInnerOpened,
        }, [ innerOpened, opened, setOpened ]);

    const [ scopeId ] = React.useState((): FocusScopeId => `popover_${self.crypto.randomUUID()}`);

    return <popoverContext.Provider value={ctx}>
        {target}

        <Drawer
            opened={ctx.opened}
            onClose={() => {
                ctx.setOpened(false);
            }}
            withinPortal={!nested}
            shadow='xl'
            {...rest}
        >
            <PopoverDropdownWithControls scopeId={scopeId} focusOnMount={focusOnMount}>
                {dropdown}
            </PopoverDropdownWithControls>
        </Drawer>
    </popoverContext.Provider>;
};
