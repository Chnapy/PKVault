import type React from 'react';
import { theme } from '../theme';
import { css } from '@emotion/css';

export type NumberInputProps = {
    value: number;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    rangeMin?: number;
    rangeMax?: number;
};

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, rangeMin, rangeMax }) => {

    return <div
        style={{
            color: theme.text.light,
            backgroundColor: theme.bg.darker,
            borderRadius: 4,
            display: 'flex',
            filter: theme.shadow.filter,
            overflow: 'hidden'
        }}
    >
        <input
            type="text"
            value={value}
            onChange={onChange}
            style={{
                width: '100%',
                color: theme.text.default,
                backgroundColor: theme.bg.light,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.bg.darker,
                borderRadius: 4,
                padding: '2px 4px',
                textShadow: theme.shadow.text,
            }}
        />

        {rangeMin !== undefined && rangeMax !== undefined &&
            <input
                type='range'
                value={value}
                onChange={onChange}
                min={rangeMin}
                max={rangeMax}
                className={css({
                    appearance: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: 3,
                    width: 40,

                    /* Input Track */

                    /* Chrome, Safari, Edge (Chromium) */
                    '&::-webkit-slider-runnable-track': {
                        background: theme.bg.darker,
                        border: `1px solid ${theme.bg.darker}`,
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        cursor: 'w-resize'
                    },

                    /* Input Thumb */

                    /* Chrome, Safari, Edge (Chromium) */
                    '&::-webkit-slider-thumb': {
                        appearance: 'none',
                        background: theme.bg.light,
                        width: '4px',
                        height: '100%',
                        cursor: 'w-resize'
                    },

                    /* Focus styles */

                    '&:focus': {
                        outline: 'none',
                    },

                    /* Chrome, Safari, Edge (Chromium) */
                    // '&:focus::-webkit-slider-thumb': {
                    //     outline: '2px solid #fff',
                    //     outlineOffset: 2,
                    // },
                })}
            />}
    </div>;
};
