import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel, type PopoverButtonProps, type PopoverPanelProps } from '@headlessui/react';
import React from 'react';
import type { ReactTag } from '../container/container';
import { TitledContainer } from '../container/titled-container';
import { type ButtonProps } from './button';
import { ButtonLike } from './button-like';

export type ButtonWithDisabledPopoverProps<AS extends ReactTag> = ButtonProps<AS> & Pick<PopoverPanelProps, 'anchor'> & {
    rootStyle?: React.CSSProperties;
    showHelp: boolean;
    helpTitle: React.ReactNode;
    helpContent?: React.ReactNode;
};

export const ButtonWithDisabledPopover = <AS extends ReactTag>({ loading, disabled, rootStyle, anchor = 'bottom', showHelp, helpTitle, helpContent, ...btnProps }: ButtonWithDisabledPopoverProps<AS>) => {
    const [ hover, setHover ] = React.useState(false);
    const [ loadingState, setLoadingState ] = React.useState(false);

    loading = loading || loadingState || undefined;

    disabled = disabled || loading || undefined;

    const finalOnClick: React.MouseEventHandler | undefined = !disabled && btnProps.onClick
        ? ((e) => {
            const result: unknown = btnProps.onClick?.(e);
            if (result instanceof Promise) {
                setLoadingState(true);
                result.finally(() => {
                    setLoadingState(false);
                });
            }
        })
        : undefined;

    const finalBtnProps = {
        ...btnProps,
        onClick: finalOnClick,
        loading,
        disabled,
    } as PopoverButtonProps;

    return <Popover
        className={css({
            display: 'flex',
            flexDirection: 'column',
        })}
        style={rootStyle}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
    >
        <PopoverButton
            {...finalBtnProps as PopoverButtonProps}
            as={btnProps.as as PopoverButtonProps[ 'as' ] ?? ButtonLike}
        />

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
