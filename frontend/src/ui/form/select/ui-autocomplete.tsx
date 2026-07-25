import { Autocomplete } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import type React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UIAutocompleteProps = Autocomplete.Props & {
    name: string;
};

export const UIAutocomplete: React.FC<UIAutocompleteProps> = ({ name, ...rest }) => {
    const { t } = useTranslate();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            getSelectControl({
                label: t('action.focus'),
            }),
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('open')}>
        <Autocomplete
            {...focusProps}
            {...controlProps('open')}
            {...rest}
            ref={ref}
            onChange={value => {
                controlProps('open').onChange?.(value as never);
                rest.onChange?.(value);
            }}
        />
    </WithControlsIcons>;
};
