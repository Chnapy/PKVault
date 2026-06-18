import { getSingleElementChild, Paper, Popover } from '@mantine/core';
import React from 'react';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { popoverContext, type PopoverContext } from './context/popover-context';
import { usePopover } from './hooks/use-popover';
import { PopoverDropdownWithControls } from './popover-dropdown-with-controls';

export type PopoverWithControlsProps = Partial<PopoverContext> & {
    // target props are passed by mantine
    target: React.ReactElement;
    dropdown: React.ReactNode;
    dropdownProps?: Popover.Dropdown.Props;
    nested?: boolean;
    transparent?: boolean;
} & Omit<Popover.Props, 'opened' | 'withinPortal'>;

export const PopoverWithControls: React.FC<PopoverWithControlsProps> = ({ opened, setOpened, target, dropdown, dropdownProps, nested, transparent, ...rest }) => {
    const [ innerOpened, setInnerOpened ] = React.useState(false);

    const ctx = React.useMemo((): PopoverContext => opened !== undefined && setOpened
        ? { opened, setOpened }
        : {
            opened: innerOpened,
            setOpened: setInnerOpened,
        }, [ innerOpened, opened, setOpened ]);

    // const nested = false//!!usePopover()?.opened;

    const [ scopeId ] = React.useState((): FocusScopeId => `popover_${self.crypto.randomUUID()}`);

    const targetEl = getSingleElementChild(target);
    if (targetEl
        && targetEl.props && typeof targetEl.props === 'object'
        && 'id' in targetEl.props && typeof targetEl.props.id === 'string'
    ) {
        throw new Error(`Popover Target child should not have props "id" [id='${targetEl.props.id}'], value will be overidden.`);
    }

    return <popoverContext.Provider value={ctx}>
        <Popover
            opened={ctx.opened}
            onChange={ctx.setOpened}
            withinPortal={!nested}
            {...rest}
        >
            <Popover.Target>
                {target}
            </Popover.Target>

            <Popover.Dropdown
                component={Paper} p={transparent ? 0 : 'md'}
                mah='calc(100vh - 1rem)' display='flex'
                {...dropdownProps}
                style={{
                    ...transparent
                        ? {
                            background: 'transparent',
                            border: 'none',
                        }
                        : undefined,
                    ...dropdownProps?.style,
                }}
            >
                <PopoverDropdownWithControls scopeId={scopeId}>
                    {dropdown}
                </PopoverDropdownWithControls>
            </Popover.Dropdown>
        </Popover>
    </popoverContext.Provider>;
};
