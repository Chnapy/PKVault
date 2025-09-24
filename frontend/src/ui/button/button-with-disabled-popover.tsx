import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel, type PopoverButtonProps, type PopoverPanelProps } from '@headlessui/react';
import React from 'react';
import type { ReactTag } from '../container/container';
import { TitledContainer } from '../container/titled-container';
import { Button, type ButtonProps } from './button';

export type ButtonWithDisabledPopoverProps<AS extends ReactTag> = ButtonProps<AS> & Pick<PopoverPanelProps, 'anchor'> & {
    showHelp: boolean;
    helpTitle: React.ReactNode;
    helpContent?: React.ReactNode;
};

export const ButtonWithDisabledPopover = <AS extends ReactTag>({ anchor = 'bottom', showHelp, helpTitle, helpContent, ...btnProps }: ButtonWithDisabledPopoverProps<AS>) => {
    const [ hover, setHover ] = React.useState(false);

    return <Popover
        className={css({
            display: 'flex',
            flexDirection: 'column',
        })}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
    >
        <PopoverButton {...btnProps as PopoverButtonProps} as={btnProps.as as PopoverButtonProps[ 'as' ] ?? Button} />

        {showHelp && hover && <PopoverPanel
            static
            anchor={anchor}
            className={css({
                zIndex: 30,
                // display: hover ? undefined : 'none',
                pointerEvents: 'none',
            })}
        >
            <div style={{ maxWidth: 350, whiteSpace: 'break-spaces' }}>
                <TitledContainer
                    contrasted
                    title={helpTitle}
                >{helpContent}</TitledContainer>
            </div>
        </PopoverPanel>}
    </Popover>;
};
