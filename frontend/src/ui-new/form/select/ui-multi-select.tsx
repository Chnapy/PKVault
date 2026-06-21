import { MultiSelect, type ComboboxItem, type ComboboxLikeRenderOptionInput } from '@mantine/core';
import { CheckIcon } from 'lucide-react';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getBackControl } from '../../interaction/focus-controls/common-controls/back-controls';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import type { FocusScopeId } from '../../interaction/focus/provider/focus-context';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';

export type UIMultiSelectProps = {
    name: string;
    controlLabel: string;
    pillsNoWrap?: boolean;
} & MultiSelect.Props;

export const UIMultiSelect: React.FC<UIMultiSelectProps> = ({ name, controlLabel, pillsNoWrap, className, style, ...rest }) => {
    const [ scopeId ] = React.useState((): FocusScopeId => `dropdown_${self.crypto.randomUUID()}`);

    const { popScope } = Focus.usePushPopScope();

    const { focusProps, nodeId, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        controls: [
            getSelectControl({
                label: controlLabel,
                action: () => {
                    (focusProps.ref as React.RefObject<HTMLInputElement>).current?.querySelector('input')?.click();
                },
            }),
        ],
    });

    const optionBack = () => {
        popScope(scopeId);
        focusProps.ref.current?.click();
    };

    return <WithControlsIcons placement='out' icons={controlIcons('open')} className={className} style={style}>
        <FocusScope id={scopeId} parentNodeId={nodeId}>
            <MultiSelect
                {...rest}
                onChange={(value) => {
                    controlProps('open').onChange?.(value as never);
                    rest.onChange?.(value);
                }}
                renderOption={item => <OptionComponent
                    {...item}
                    focusOnMount={rest.data!.indexOf(item.option.value) === 0}
                    back={optionBack}
                >
                    {rest.renderOption?.(item)}
                </OptionComponent>}
                wrapperProps={{
                    ...focusProps,
                    ...controlProps('open'),
                    style: { borderRadius: 'var(--mantine-radius-default)' }
                }}
                styles={{
                    root: {
                        flexGrow: 1,
                    },
                    pillsList: pillsNoWrap ? {
                        flexWrap: 'nowrap',
                    } : undefined,
                }}
            />
        </FocusScope>
    </WithControlsIcons>;
};

const OptionComponent: React.FC<ComboboxLikeRenderOptionInput<ComboboxItem<string>> & {
    focusOnMount: boolean;
    back: () => void;
    children?: React.ReactNode;
}> = ({ option, checked, focusOnMount, back, children }) => {
    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: option.value,
        focusOnMount,
        controls: [
            getSelectControl({
                label: 'Select',
                action: () => {
                    focusProps.ref.current?.click();
                },
            }),
            getBackControl({
                label: 'Back',
                action: () => {
                    back();
                },
            }),
        ],
    });

    return <WithControlsIcons placement='out' icons={controlIcons('open')}
        {...focusProps}
        {...controlProps('open', 'back')}
        bdrs='xs'
        style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            paddingLeft: 4,
            paddingRight: 4,
        }}
    >
        {children ?? <>
            {checked && <CheckIcon />}
            {option.label}
        </>}
    </WithControlsIcons>;
};
