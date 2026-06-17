import { Button, type ElementProps } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
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

export const UIButton: React.FC<UIButtonProps> = ({ name, controlLabel, controlIcons = [], focusOnMount, onClick, onFocusSelect = onClick, mt, style, ...rest }) => {

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

    return <WithControlsIcons placement='out' icons={[ controlsIcons.open, ...controlIcons ]} display='inline-flex' h='fit-content' mt={mt} style={style}>
        <Button
            {...focusControlProps}
            {...rest}
            ref={ref}
            w='100%'
        />
    </WithControlsIcons>;
};
