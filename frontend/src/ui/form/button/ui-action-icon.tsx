import { ActionIcon, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UIActionIconProps = {
    name: string;
    controlLabel: string;
    controlIcons?: React.ReactNode[];
    focusOnMount?: boolean;
} & ActionIcon.Props & ElementProps<'button'>;

export const UIActionIcon: React.FC<UIActionIconProps> = ({
    name, controlLabel, controlIcons: extraControlIcons = [], focusOnMount, onClick: onClickInner,
    h, w, mt, ml, style, ...rest
}) => {
    const [ loadingInner, setLoading ] = React.useState(false);

    const loading = loadingInner || rest.loading;

    const onClick: typeof onClickInner = onClickInner && (e => {
        const result: unknown = onClickInner(e);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    });

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

    return <WithControlsIcons placement='out' icons={[ controlIcons('open'), ...extraControlIcons ]}
        display='inline-flex' h={h ?? 'fit-content'} w={w ?? 'fit-content'} mt={mt} ml={ml} style={style}
    >
        <ActionIcon
            {...focusProps}
            {...controlProps('open')}
            {...rest}
            onClick={onClick}
            ref={ref}
            loading={loading}
            style={{
                flexGrow: 1,
            }}
        />
    </WithControlsIcons>;
};

