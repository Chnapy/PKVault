import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel, type PopoverPanelProps } from '@headlessui/react';
import React from 'react';
import { Button, type ButtonProps } from './button';
import { TitledContainer } from '../container/titled-container';

export type ButtonWithPopoverProps = Omit<ButtonProps<typeof PopoverButton>, 'as' | 'componentDescriptor' | 'onClick'>
    & Pick<PopoverPanelProps, 'anchor'> & {
        panelTitle?: React.ReactNode;
        panelContent?: (close: () => void) => React.ReactNode;
    };

export const ButtonWithPopover: React.FC<ButtonWithPopoverProps> = ({ anchor = 'bottom', panelTitle, panelContent, ...btnProps }) => {

    return <Popover
        style={{
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        {({ open, close }) => <>
            <PopoverButton as={Button} {...btnProps} disabled={open || btnProps.disabled} />

            {open && <PopoverPanel
                static
                anchor={anchor}
                className={css({ zIndex: 30 })}
            >
                <TitledContainer
                    contrasted
                    title={panelTitle}
                >{panelContent?.(close)}</TitledContainer>
            </PopoverPanel>}
        </>}
    </Popover>;
};
