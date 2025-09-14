import { Listbox, ListboxButton, ListboxOption, ListboxOptions, type ListboxOptionsProps } from '@headlessui/react';
import React from 'react';
import { Button, type ButtonProps } from '../button/button';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';

export type SelectInputProps = {
    value: number;
    onChange: (value: number) => void;
    data: { value: number; option: React.ReactNode; disabled?: boolean }[];
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

            <ListboxOptions anchor={anchor}>
                <TitledContainer
                    contrasted
                    title={null}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: 500,
                            overflowY: 'auto',
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
