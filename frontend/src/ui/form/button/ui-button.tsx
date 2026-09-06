import { Button, type ElementProps, type PolymorphicComponentProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { clsx } from 'clsx';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { useClickLoading } from './hooks/use-click-loading';
import classes from './ui-button.module.css';

export type UIButtonProps<C = 'button'> = {
    name: string;
    controlLabel: string;
    controlIcons?: React.ReactNode[];
    focusOnMount?: boolean;
    selected?: boolean;
    noLabelTabletScreen?: boolean;
    noLabelMobileScreen?: boolean;
}
    & Pick<ElementProps<'button'>, 'onClick' | 'ref'>
    & PolymorphicComponentProps<C, Button.Props>;

export const UIButton = function <C = 'button'>({
    name, controlLabel, controlIcons: extraControlIcons = [], focusOnMount, selected, onClick: onClickInner, noLabelTabletScreen, noLabelMobileScreen,
    component, w, miw, mx, ml, mt, style, ...rest
}: UIButtonProps<C>) {
    const { onClick, loading } = useClickLoading(onClickInner, rest.loading);

    if (!controlLabel)
        console.warn('controlLabel is empty', { name })

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            !rest.disabled && !rest.loading && getSelectControl({
                label: controlLabel,
            }),
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={[ controlIcons('open'), ...extraControlIcons ]} className={classes.uiButton} display='inline-flex' h='fit-content'
        w={w} miw={miw} mx={mx} ml={ml} mt={mt} style={style}>
        <Button
            component={component as never}
            {...focusProps}
            {...controlProps('open')}
            {...rest}
            className={clsx(
                classes.button,
                selected && classes.selected,
                noLabelTabletScreen && classes.noLabelTabletScreen,
                noLabelMobileScreen && classes.noLabelMobileScreen,
                rest.className,
            )}
            onClick={onClick}
            ref={ref}
            loading={loading}
        />
    </WithControlsIcons>;
};
