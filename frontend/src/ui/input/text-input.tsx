import React from 'react';
import { theme } from '../theme';

export type TextInputProps = {
    value?: string;
    label?: string;
    area?: boolean;
}
    & React.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement>;

export const TextInput = React.forwardRef<never, TextInputProps>(({ value, onChange, label, area, ...rest }, ref) => {
    const inputStyle: React.CSSProperties = {
        flexGrow: 1,
        width: '100%',
        color: theme.text.default,
        backgroundColor: theme.bg.default,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.bg.darker,
        borderRadius: 4,
        padding: '2px 4px',
        textShadow: theme.shadow.text,
    };

    return <label
        style={{
            display: 'flex',
            flexDirection: 'column',
            color: theme.text.light,
            backgroundColor: theme.bg.darker,
            borderRadius: 4,
            filter: theme.shadow.filter,
            overflow: 'hidden',
            ...rest.style,
        }}
    >
        {label && <div
            style={{
                padding: 4,
                cursor: 'pointer',
                textShadow: theme.shadow.textlight,
            }}
        >
            {label}
        </div>}

        {area
            ? <textarea
                ref={ref}
                value={value}
                onChange={onChange}
                readOnly={!onChange}
                {...rest}
                style={inputStyle}
            />
            : <input
                ref={ref}
                type="text"
                value={value}
                onChange={onChange}
                readOnly={!onChange}
                {...rest}
                style={inputStyle}
            />
        }

    </label>;
});
