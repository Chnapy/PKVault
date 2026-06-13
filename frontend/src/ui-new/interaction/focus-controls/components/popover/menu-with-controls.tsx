import { getSingleElementChild, Menu } from '@mantine/core';
import React from 'react';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { popoverContext, type PopoverContext } from './context/popover-context';
import { usePopover } from './hooks/use-popover';
import { PopoverDropdownWithControls } from './popover-dropdown-with-controls';

export type MenuWithControlsProps = Partial<PopoverContext> & {
    // target props are passed by mantine
    target: React.ReactElement;
    dropdown: React.ReactNode;
    dropdownProps?: Menu.Dropdown.Props;
} & Omit<Menu.Props, 'opened' | 'withinPortal'>;

export const MenuWithControls: React.FC<MenuWithControlsProps> = ({ opened, setOpened, target, dropdown, dropdownProps, ...rest }) => {
    const [ innerOpened, setInnerOpened ] = React.useState(false);

    const ctx = React.useMemo((): PopoverContext => opened !== undefined && setOpened
        ? { opened, setOpened }
        : {
            opened: innerOpened,
            setOpened: setInnerOpened,
        }, [ innerOpened, opened, setOpened ]);

    const nested = !!usePopover()?.opened;

    const [ scopeId ] = React.useState((): FocusScopeId => `popover_${self.crypto.randomUUID()}`);

    const targetEl = getSingleElementChild(target);
    if (targetEl
        && targetEl.props && typeof targetEl.props === 'object'
        && 'id' in targetEl.props && typeof targetEl.props.id === 'string'
    ) {
        throw new Error(`Popover Target child should not have props "id" [id='${targetEl.props.id}'], value will be overidden.`);
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

            <Menu.Dropdown {...dropdownProps}>
                <PopoverDropdownWithControls scopeId={scopeId}>
                    {dropdown}
                </PopoverDropdownWithControls>
            </Menu.Dropdown>
        </Menu>
    </popoverContext.Provider>;
};
