import { getSingleElementChild, Popover } from '@mantine/core';
import React from 'react';
import type { FocusScopeId } from '../../../focus/provider/focus-context';
import { PopoverDropdownWithControls } from './popover-dropdown-with-controls';

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

type PopoverWithControlsProps = {
    nested?: boolean;
    // target props are passed by mantine
    target: React.ReactElement<PopoverTargetChildProps>;
    dropdown: React.ReactNode;
};

export const PopoverWithControls: React.FC<PopoverWithControlsProps> = ({ nested, target, dropdown }) => {
    const [ scopeId ] = React.useState((): FocusScopeId => `popover_${self.crypto.randomUUID()}`);

    const targetEl = getSingleElementChild(target);
    if (targetEl
        && targetEl.props && typeof targetEl.props === 'object'
        && 'id' in targetEl.props && typeof targetEl.props.id === 'string'
    ) {
        throw new Error(`Popover Target child should not have props "id" [id='${targetEl.props.id}'], value will be overidden.`);
    }

    return <Popover withinPortal={nested}>
        <Popover.Target>
            {target}
        </Popover.Target>

        <Popover.Dropdown>
            <PopoverDropdownWithControls scopeId={scopeId}>
                {dropdown}
            </PopoverDropdownWithControls>
        </Popover.Dropdown>
    </Popover>;
};
