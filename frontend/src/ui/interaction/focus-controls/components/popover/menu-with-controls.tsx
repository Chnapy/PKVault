import { getSingleElementChild, Menu, Paper } from '@mantine/core';
import React from 'react';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { popoverContext, type PopoverContext } from './context/popover-context';
import { PopoverDropdownWithControls } from './popover-dropdown-with-controls';

export type MenuWithControlsProps = Partial<PopoverContext> & {
    // target props are passed by mantine
    target: React.ReactElement;
    dropdown: React.ReactNode;
    dropdownProps?: Menu.Dropdown.Props;
    focusOnMount?: boolean;
    nested?: boolean;
} & Omit<Menu.Props, 'opened' | 'withinPortal'>;

export const MenuWithControls: React.FC<MenuWithControlsProps> = ({ opened, setOpened, target, dropdown, dropdownProps, focusOnMount, nested, ...rest }) => {
    const [ innerOpened, setInnerOpened ] = React.useState(false);

    const ctx = React.useMemo((): PopoverContext => opened !== undefined && setOpened
        ? { opened, setOpened }
        : {
            opened: innerOpened,
            setOpened: setInnerOpened,
        }, [ innerOpened, opened, setOpened ]);

    const [ scopeId ] = React.useState((): FocusScopeId => `menu_${Math.random()}`);

    const targetEl = getSingleElementChild(target);
    if (targetEl
        && targetEl.props && typeof targetEl.props === 'object'
        && 'id' in targetEl.props && typeof targetEl.props.id === 'string'
    ) {
        throw new Error(`Popover Target child should not have props "id" [id='${targetEl.props.id}'], value will be overridden.`);
    }

    return <popoverContext.Provider value={ctx}>
        <Menu
            opened={ctx.opened}
            onChange={ctx.setOpened}
            withinPortal={!nested}
            {...rest}
        >
            <Menu.Target>
                {target}
            </Menu.Target>

            <Menu.Dropdown component={Paper} {...dropdownProps}>
                <PopoverDropdownWithControls scopeId={scopeId} focusOnMount={focusOnMount}>
                    {dropdown}
                </PopoverDropdownWithControls>
            </Menu.Dropdown>
        </Menu>
    </popoverContext.Provider>;
};
