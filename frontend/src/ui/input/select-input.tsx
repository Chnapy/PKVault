import { Listbox, ListboxButton, ListboxOption, ListboxOptions, type ListboxOptionsProps } from '@headlessui/react';
import React from 'react';
import { Button, type ButtonProps } from '../button/button';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';
import { theme } from '../theme';
import { css, cx } from '@emotion/css';

export type DataOption<K extends string | number> = { value: K; option: React.ReactNode; disabled?: boolean };

export type SelectInputProps<K extends string | number = string | number> = {
    label?: string;
    value?: K;
    onChange: (value: K) => void;
    data: DataOption<K>[];
    renderOption?: (option: DataOption<K>) => React.ReactNode;
    anchor?: ListboxOptionsProps[ 'anchor' ];
}
    & Omit<ButtonProps<'button'>, 'onChange'>;

const SelectInput = React.forwardRef<HTMLButtonElement, React.PropsWithChildren<SelectInputProps>>(({
    label, value, onChange, data, renderOption, anchor = 'bottom', ...rest
}, ref) => {
    renderOption ??= item => <ListboxOption
        key={item.value}
        as={Button}
        value={item.value}
        disabled={item.disabled}
        className={item.disabled
            ? css({
                opacity: 0.5,
                cursor: 'not-allowed'
            })
            : undefined
        }
    >
        {item.option}
    </ListboxOption>;

    return (<label
        className={cx(css({
            display: 'inline-flex',
            flexDirection: 'column',
            color: theme.text.light,
            backgroundColor: label ? theme.bg.darker : undefined,
            borderRadius: 4,
            filter: theme.shadow.filter,
            overflow: 'hidden',
            verticalAlign: 'middle',
        }), rest.className)}
    >
        {label && <div
            className={css({
                padding: 4,
                cursor: 'pointer',
                textShadow: theme.shadow.textlight,
            })}
        >
            {label}
        </div>}

        <Listbox value={value} onChange={onChange}>
            <ListboxButton as={Button} ref={ref} {...rest}>
                <div className={css({ flexGrow: 1, margin: '-2px -4px', marginRight: 0, overflow: 'hidden' })}>
                    {data.find(item => item.value === value)?.option}
                </div>

                <Icon name='angle-down' solid forButton />
            </ListboxButton>

            <ListboxOptions anchor={anchor} className={css({ zIndex: 30 })}>
                <TitledContainer
                    contrasted
                    title={null}
                    maxHeight={500}
                >
                    <div
                        className={css({
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        })}
                    >
                        {data.map(renderOption)}
                    </div>
                </TitledContainer>
            </ListboxOptions>
        </Listbox>
    </label>
    );
});

export const SelectStringInput = SelectInput as ReturnType<typeof React.forwardRef<HTMLButtonElement, React.PropsWithChildren<SelectInputProps<string>>>>;
export const SelectNumberInput = SelectInput as ReturnType<typeof React.forwardRef<HTMLButtonElement, React.PropsWithChildren<SelectInputProps<number>>>>;
