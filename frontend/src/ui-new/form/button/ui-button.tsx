import { Button, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UIButtonProps = {
    name: string;
    controlLabel: string;
    controlIcons?: React.ReactNode[];
    focusOnMount?: boolean;
    onFocusSelect?: (e: Event) => void;
} & Button.Props & ElementProps<'button'>;

export const UIButton: React.FC<UIButtonProps> = ({ name, controlLabel, controlIcons = [], focusOnMount, onClick: onClickInner, onFocusSelect: onFocusSelectInner, w, miw, mt, style, ...rest }) => {
    const [ loadingInner, setLoading ] = React.useState(false);

    const loading = loadingInner || rest.loading;

    onFocusSelectInner ??= onClickInner as typeof onFocusSelectInner;

    const onClick: typeof onClickInner = onClickInner && (e => {
        const result: unknown = onClickInner(e);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    });

    const onFocusSelect: typeof onFocusSelectInner = onFocusSelectInner && (e => {
        const result: unknown = onFocusSelectInner(e);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    });

    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            getSelectControl({
                label: controlLabel,
                action: (e, trigger) => {
                    switch (trigger) {
                        case 'mouse':
                            onClick?.(e);
                            break;
                        default:
                            onFocusSelect?.(e);
                            break;
                    }
                },
            }),
        ],
        // controlsEnable: rest.disabled ? false : undefined,
    });

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={[ controlsIcons.open, ...controlIcons ]} display='inline-flex' h='fit-content' w={w} miw={miw} mt={mt} style={style}>
        <Button
            {...focusControlProps}
            {...rest}
            ref={ref}
            loading={loading}
            w='100%'
        />
    </WithControlsIcons>;
};
