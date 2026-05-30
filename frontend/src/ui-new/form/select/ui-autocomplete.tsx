import { Autocomplete } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UIAutocompleteProps = Autocomplete.Props & {
    name: string;
};

export const UIAutocomplete: React.FC<UIAutocompleteProps> = ({ name, ...rest }) => {
    const { focusControlProps, controlsIcons } = useFocusControls({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            getSelectControl({
                label: 'Focus',
                action: () => {
                    focusControlProps.ref.current.focus();
                },
            }),
        ],
    });

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={controlsIcons.open}>
        <Autocomplete
            {...focusControlProps}
            {...rest}
            ref={ref}
            onChange={value => {
                focusControlProps.onChange?.(value as never);
                rest.onChange?.(value);
            }}
        />
    </WithControlsIcons>;
};
