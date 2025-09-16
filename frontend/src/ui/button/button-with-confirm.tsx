import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel, type PopoverPanelProps } from '@headlessui/react';
import type React from 'react';
import { Button, type ButtonProps } from './button';
import { TitledContainer } from '../container/titled-container';

export type ButtonWithConfirmProps = Omit<ButtonProps<typeof PopoverButton>, 'as' | 'componentDescriptor'>
    & Pick<PopoverPanelProps, 'anchor'>;

export const ButtonWithConfirm: React.FC<ButtonWithConfirmProps> = ({ onClick, anchor = 'bottom', ...btnProps }) => {

    return <Popover
        style={{
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        {({ open, close }) => <>
            <PopoverButton as={Button} {...btnProps} />

            {open && <PopoverPanel
                static
                anchor={anchor}
                className={css({ zIndex: 30 })}
            >
                <TitledContainer
                    contrasted
                    title={null}
                >
                    <Button onClick={async () => {
                        await onClick();

                        close();
                    }}>Confirm ?</Button>
                </TitledContainer>
            </PopoverPanel>}
        </>}
    </Popover>;
};
