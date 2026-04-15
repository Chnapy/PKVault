import React from 'react';
import { theme } from '../theme';
import { css } from '@emotion/css';

export type CheckboxInputProps = {
    id?: string;
    checked: boolean;
    indeterminate?: boolean;
    onChange: React.MouseEventHandler<HTMLDivElement>;
    disabled?: boolean;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = ({ id, checked, indeterminate = false, onChange, disabled }) => {
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [ indeterminate ]);

    return <div
        role='checkbox'
        className={css({
            display: 'inline-flex',
            cursor: disabled ? 'not-allowed' : 'pointer',
        })}
        onClick={disabled ? undefined : onChange}
    >
        <input
            ref={ref}
            type='checkbox'
            id={id}
            className={css({
                width: '1lh',
                height: '1lh',
                accentColor: theme.bg.primary,
                pointerEvents: 'none',
            })}
            checked={checked}
            readOnly
            disabled={disabled}
        />
    </div >;
};
