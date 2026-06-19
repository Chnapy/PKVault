import { ActionIcon, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

type UIActionIconProps = {
    name: string;
    controlLabel: string;
    controlIcons?: React.ReactNode[];
    focusOnMount?: boolean;
    onFocusSelect?: (e: Event) => void;
} & ActionIcon.Props & ElementProps<'button'>;

export const UIActionIcon: React.FC<UIActionIconProps> = ({ name, controlLabel, controlIcons = [], focusOnMount, onClick: onClickInner, onFocusSelect: onFocusSelectInner, h, w, mt, style, ...rest }) => {
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
    });

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={[ controlsIcons.open, ...controlIcons ]} display='inline-flex' h={h ?? 'fit-content'} w={w ?? 'fit-content'} mt={mt} style={style}>
        <ActionIcon
            {...focusControlProps}
            {...rest}
            ref={ref}
            loading={loading}
            style={{
                flexGrow: 1,
            }}
        />
    </WithControlsIcons>;
};

