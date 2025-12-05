import React from 'react';
import { theme } from '../theme';

export type CheckboxInputProps = {
    checked: boolean;
    indeterminate?: boolean;
    onChange: React.MouseEventHandler<HTMLDivElement>;
    disabled?: boolean;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = ({ checked, indeterminate = false, onChange, disabled }) => {
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [ indeterminate ]);

    return <div
        role='checkbox'
        style={{
            display: 'inline-flex'
        }}
        onClick={disabled ? undefined : onChange}>
        <input
            ref={ref}
            type='checkbox'
            style={{
                width: '1lh',
                height: '1lh',
                accentColor: theme.bg.primary,
                pointerEvents: 'none',
            }}
            checked={checked}
            readOnly
            disabled={disabled}
        />
    </div >;
};
