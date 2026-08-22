import { Group, Select, type ComboboxItem, type Primitive } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { CheckIcon } from 'lucide-react';
import type React from 'react';
import type { GamepadMappingsAllButton } from '../../interaction/controls/gamepad/gamepad-mapper';
import { getControlIcon } from '../../interaction/controls/icons/get-control-icon';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';

export type UISelectItem<V extends Primitive> = ComboboxItem<V> & {
    icon?: React.ReactNode;
};

type UISelectProps<V extends Primitive> = {
    name: string;
    controlLabel: string;
    value: V;
    data: UISelectItem<V>[];
    onChange: (value: V | null, option: UISelectItem<V>) => void;
} & Omit<Select.Props<V>, 'value' | 'data' | 'onChange'>;

export function UISelect<V extends Primitive>({ name, controlLabel, value, data, onChange, ...rest }: UISelectProps<V>) {

    const isGamepad = useControlsCurrentType() === 'gamepad';

    const { focusProps, focused, controlProps } = useFocusControls<HTMLInputElement, 'change'>({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            !rest.disabled && {
                name: 'change',
                main: true,
                label: controlLabel,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'LB', 'RB' ],
                    }
                },
                spread: false,
                action: (e, trigger, val) => {
                    const selectedIndex = data.findIndex(d => d.value === value);
                    let nextIndex = -1;
                    switch (val as GamepadMappingsAllButton) {
                        case 'LB':
                            nextIndex = selectedIndex - 1;
                            if (nextIndex < 0)
                                nextIndex = data.length - 1;
                            break;
                        case 'RB':
                            nextIndex = selectedIndex + 1;
                            if (nextIndex > data.length - 1)
                                nextIndex = 0;
                            break;
                    }
                    const next = data[ nextIndex ]!;
                    onChange(
                        next.value,
                        next,
                    );
                },
            },
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    const leftSection = rest.leftSection ?? data.find(d => d.value === value)?.icon;

    return <Select
        name={name}
        value={value}
        data={data}
        {...focusProps}
        {...controlProps('change')}
        {...rest}
        onChange={onChange}
        ref={ref}
        styles={{
            input: isGamepad ? {
                textAlign: 'center',
            } : undefined,
            ...rest.styles,
        }}
        leftSection={isGamepad && !rest.disabled
            ? focused && getControlIcon('gamepad', [ 'LB' ]) || (leftSection ?? <span />)
            : leftSection}
        rightSection={isGamepad && !rest.disabled
            ? focused && getControlIcon('gamepad', [ 'RB' ]) || (rest.rightSection ?? <span />)
            : rest.rightSection}
        renderOption={({ option, checked }) => <Group style={{ flexGrow: 1 }}>
            {data.find(d => d.value === option.value)?.icon}
            {option.label}
            {checked && <CheckIcon style={{ marginLeft: 'auto' }} />}
        </Group>}
    />;
};
