import { css } from '@emotion/css';
import type React from 'react';

export const TextContainerSticker: React.FC<{
    gap: number;
    children: React.ReactNode;
}> = ({ gap, children }) => (
    <div
        className={css({
            display: 'flex',
            flexDirection: 'column',
            gap,

            '& > .text-container': {
                flexShrink: 0,
                flexGrow: 0,
            },
            '& > :not(.text-container-stick) + .text-container-stick': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            },
            '& > .text-container-stick:first-child': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            },
            '& > .text-container-stick + .text-container-stick:not(:nth-last-child(1 of .text-container-stick))': {
                marginTop: -gap,
                paddingTop: 0,
                borderRadius: 0,
            },
            '& > :nth-last-child(1 of .text-container-stick)': {
                marginTop: -gap,
                paddingTop: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
            },
        })}
    >
        {children}
    </div>
);