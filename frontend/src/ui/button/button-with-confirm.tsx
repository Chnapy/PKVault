import { PopoverButton, type PopoverPanelProps } from '@headlessui/react';
import React from 'react';
import { Button, type ButtonProps } from './button';
import { ButtonWithPopover } from './button-with-popover';

export type ButtonWithConfirmProps = Omit<ButtonProps<typeof PopoverButton>, 'as' | 'componentDescriptor'>
    & Pick<PopoverPanelProps, 'anchor'>;

export const ButtonWithConfirm: React.FC<ButtonWithConfirmProps> = ({ onClick, ...btnProps }) => {
    return <ButtonWithPopover
        {...btnProps}
        panelContent={close => <Button onClick={async (e) => {
            await onClick(e);

            close();
        }}>Confirm ?</Button>}
    />;
};
