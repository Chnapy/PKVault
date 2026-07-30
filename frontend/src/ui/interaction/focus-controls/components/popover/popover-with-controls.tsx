import { getSingleElementChild, Popover } from '@mantine/core';
import React from 'react';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { popoverContext, type PopoverContext } from './context/popover-context';
import { PopoverDropdownWithControls } from './popover-dropdown-with-controls';

export type PopoverWithControlsProps = Partial<PopoverContext> & {
    // target props are passed by mantine
    target: React.ReactElement;
    dropdown: React.ReactNode;
    dropdownProps?: Popover.Dropdown.Props;
    focusOnMount?: boolean;
    nested?: boolean;
} & Omit<Popover.Props, 'opened' | 'withinPortal'>;

export const PopoverWithControls: React.FC<PopoverWithControlsProps> = ({ opened, setOpened, target, dropdown, dropdownProps, focusOnMount, nested, ...rest }) => {
    const [ innerOpened, setInnerOpened ] = React.useState(false);

    const ctx = React.useMemo((): PopoverContext => opened !== undefined && setOpened
        ? { opened, setOpened }
        : {
            opened: innerOpened,
            setOpened: setInnerOpened,
        }, [ innerOpened, opened, setOpened ]);

    // const nested = false//!!usePopover()?.opened;

    const [ scopeId ] = React.useState((): FocusScopeId => `popover_${Math.random()}`);

    const targetEl = getSingleElementChild(target);
    if (targetEl
        && targetEl.props && typeof targetEl.props === 'object'
        && 'id' in targetEl.props && typeof targetEl.props.id === 'string'
    ) {
        throw new Error(`Popover Target child should not have props "id" [id='${targetEl.props.id}'], value will be overridden.`);
    }

    return <popoverContext.Provider value={ctx}>
        <Popover
            opened={ctx.opened}
            onChange={ctx.setOpened}
            withinPortal={!nested}
            shadow='xl'
            zIndex={100}
            {...rest}
        >
            <Popover.Target>
                {target}
            </Popover.Target>

            <Popover.Dropdown
                mah='calc(100vh - 1rem)'
                display='flex'
                p={0}
                {...dropdownProps}
                style={{
                    background: 'transparent',
                    border: 'none',
                    ...dropdownProps?.style,
                }}
            >
                <PopoverDropdownWithControls scopeId={scopeId} focusOnMount={focusOnMount}>
                    {dropdown}
                </PopoverDropdownWithControls>
            </Popover.Dropdown>
        </Popover>
    </popoverContext.Provider>;
};
