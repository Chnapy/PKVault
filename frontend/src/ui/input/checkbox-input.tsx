import React from 'react';
import { theme } from '../theme';

export type CheckboxInputProps = {
    checked: boolean;
    indeterminate?: boolean;
    onChange: React.MouseEventHandler<HTMLDivElement>;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = ({ checked, indeterminate = false, onChange }) => {
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
        onClick={onChange}>
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
        />
    </div>;
};
