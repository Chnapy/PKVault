import { Listbox, ListboxButton, ListboxOption, ListboxOptions, type ListboxOptionsProps } from '@headlessui/react';
import React from 'react';
import { Button, type ButtonProps } from '../button/button';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';

export type SelectInputProps<K extends string | number = string | number> = {
    value?: K;
    onChange: (value: K) => void;
    data: { value: K; option: React.ReactNode; disabled?: boolean }[];
    anchor?: ListboxOptionsProps[ 'anchor' ];
}
    & Omit<ButtonProps<'button'>, 'onChange'>;

export const SelectInput = React.forwardRef<HTMLButtonElement, React.PropsWithChildren<SelectInputProps>>(({
    value, onChange, data, anchor = 'bottom', ...rest
}, ref) => {

    return (
        <Listbox value={value} onChange={onChange}>
            <ListboxButton as={Button} ref={ref} {...rest}>
                <div style={{ flexGrow: 1, margin: '-2px -4px', marginRight: 0, overflow: 'hidden' }}>
                    {data.find(item => item.value === value)?.option}
                </div>

                <Icon name='angle-down' solid />
            </ListboxButton>

            <ListboxOptions anchor={anchor} style={{ zIndex: 30 }}>
                <TitledContainer
                    contrasted
                    title={null}
                    maxHeight={500}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {data.map(item => (
                            <ListboxOption
                                key={item.value}
                                value={item.value}
                                disabled={item.disabled}
                                style={item.disabled
                                    ? {
                                        opacity: 0.5,
                                        cursor: 'not-allowed'
                                    }
                                    : undefined
                                }
                            >
                                {item.option}
                            </ListboxOption>
                        ))}
                    </div>
                </TitledContainer>
            </ListboxOptions>
        </Listbox>
    );
});
