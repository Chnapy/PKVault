import { Button, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UIButtonProps = {
    name: string;
    controlLabel: string;
    controlIcons?: React.ReactNode[];
    focusOnMount?: boolean;
} & Button.Props & ElementProps<'button'>;

export const UIButton: React.FC<UIButtonProps> = ({ name, controlLabel, controlIcons: extraControlIcons = [], focusOnMount, onClick: onClickInner, w, miw, mx, mt, style, ...rest }) => {
    const [ loadingInner, setLoading ] = React.useState(false);

    const loading = loadingInner || rest.loading;

    const onClick: typeof onClickInner = onClickInner && (e => {
        const result: unknown = onClickInner(e);
        if (result instanceof Promise) {
            setLoading(true);
            result.finally(() => setLoading(false));
        }
    });

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

    return <WithControlsIcons placement='out' icons={[ controlIcons('open'), ...extraControlIcons ]} display='inline-flex' h='fit-content' w={w} miw={miw} mx={mx} mt={mt} style={style}>
        <Button
            {...focusProps}
            {...controlProps('open')}
            {...rest}
            onClick={onClick}
            ref={ref}
            loading={loading}
            w='100%'
        />
    </WithControlsIcons>;
};
