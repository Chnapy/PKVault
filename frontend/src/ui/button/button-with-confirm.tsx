import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import type React from 'react';
import { Button, type ButtonProps } from './button';

export type ButtonWithConfirmProps = Omit<ButtonProps<typeof PopoverButton>, 'as' | 'componentDescriptor'>;

export const ButtonWithConfirm: React.FC<ButtonWithConfirmProps> = ({ onClick, ...btnProps }) => {

    return <Popover className="relative">
        <Button as={PopoverButton} componentDescriptor="button" {...btnProps} />

        <PopoverPanel
            anchor="bottom"
            className={css({ overflow: "unset !important" })}
        >
            <Button onClick={onClick}>Confirm ?</Button>
        </PopoverPanel>
    </Popover>;
};
