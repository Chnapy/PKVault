import { css, cx } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel, type PopoverButtonProps, type PopoverPanelProps } from '@headlessui/react';
import React from 'react';
import type { ReactTag } from '../container/container';
import { TitledContainer } from '../container/titled-container';
import { type ButtonProps } from './button';
import { ButtonLike } from './button-like';

export type ButtonWithDisabledPopoverProps<AS extends ReactTag> = ButtonProps<AS> & Pick<PopoverPanelProps, 'anchor'> & {
    rootClassName?: string;
    showHelp: boolean;
    helpTitle: React.ReactNode;
    helpContent?: React.ReactNode;
    extraContent?: React.ReactNode;
};

export const ButtonWithDisabledPopover = <AS extends ReactTag>({ loading, disabled, rootClassName, anchor = 'bottom', showHelp, helpTitle, helpContent, extraContent, ...btnProps }: ButtonWithDisabledPopoverProps<AS>) => {
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
        className={cx(
            css({
                display: 'flex',
                flexDirection: 'column',
            }),
            rootClassName
        )}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
    >
        <PopoverButton
            {...finalBtnProps as PopoverButtonProps}
            as={btnProps.as as PopoverButtonProps[ 'as' ] ?? ButtonLike}
        />

        {extraContent}

        {showHelp && hover && <PopoverPanel
            static
            anchor={anchor}
            className={css({
                zIndex: 30,
                pointerEvents: 'none',
            })}
        >
            <div className={css({ maxWidth: 350, whiteSpace: 'break-spaces' })}>
                <TitledContainer
                    contrasted
                    title={helpTitle}
                >{helpContent}</TitledContainer>
            </div>
        </PopoverPanel>}
    </Popover>;
};
