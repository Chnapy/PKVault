import { css } from '@emotion/css';
import type React from 'react';

export const ButtonSticker: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => (
    <div className={css({
        display: 'flex',

        '> :not(:first-child)': {
            marginLeft: -1,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
        '> :not(:last-child)': {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },
    })}>
        {children}
    </div>
);