import type React from 'react';
import { theme } from '../theme';
import { css } from '@emotion/css';

export type NumberInputProps = {
    value?: number;
    rangeMin?: number;
    rangeMax?: number;
}
    & React.HTMLAttributes<HTMLInputElement>;

export const NumberInput: React.FC<NumberInputProps> = ({ value, rangeMin, rangeMax, ...rest }) => {
    return <div
        style={{
            color: theme.text.light,
            backgroundColor: theme.bg.darker,
            borderRadius: 4,
            display: 'inline-flex',
            filter: theme.shadow.filter,
            overflow: 'hidden',
            verticalAlign: 'middle',
            ...rest.style,
        }}
    >
        <input
            type="text"
            value={value}
            {...rest}
            style={{
                width: '100%',
                color: theme.text.default,
                backgroundColor: theme.bg.default,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.bg.darker,
                borderRadius: 4,
                padding: '2px 4px',
                textShadow: theme.shadow.text,
                textAlign: rest.style?.textAlign,
            }}
        />

        {rangeMin !== undefined && rangeMax !== undefined &&
            <input
                type='range'
                value={value}
                min={rangeMin}
                max={rangeMax}
                {...rest}
                className={css({
                    appearance: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: 3,
                    width: 40,
                    '&::-webkit-slider-runnable-track': {
                        background: theme.bg.darker,
                        border: `1px solid ${theme.bg.darker}`,
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        cursor: 'w-resize'
                    },
                    '&::-webkit-slider-thumb': {
                        appearance: 'none',
                        background: theme.bg.light,
                        width: '4px',
                        height: '100%',
                        cursor: 'w-resize'
                    },
                    '&:focus': {
                        outline: 'none',
                    },
                })}
            />}
    </div>;
};
