import type React from 'react';
import { theme } from '../theme';
import { css } from '@emotion/css';

export const Frame: React.FC<React.PropsWithChildren> = ({ children }) => {

    return <div
        data-move-root
        className={css({
            // scrollbar depends on browser
            '--scrollbar-width': 10,
            '--scrollbar-width-px': 'calc(var(--scrollbar-width) * 1px)',

            '@supports (-moz-appearance:none)': {
                '&': {
                    '--scrollbar-width': 8,
                }
            },

            position: 'relative',
            height: "100vh",
            overflow: 'scroll',
            scrollbarColor: `${theme.bg.contrastdark} ${theme.bg.contrast}`,
            borderWidth: 'var(--scrollbar-width-px)',
            borderStyle: 'solid',
            borderColor: theme.bg.contrast,
            borderRight: 'none',
            borderBottom: 'none',
            backgroundColor: theme.bg.app,
            backgroundImage: `radial-gradient(${theme.bg.appdark} 4px, ${theme.bg.app} 4px)`,
            backgroundSize: '40px 40px',

            '&::before': {
                content: '""',
                position: 'fixed',
                top: 'var(--scrollbar-width-px)',
                bottom: 'var(--scrollbar-width-px)',
                left: 'var(--scrollbar-width-px)',
                right: 'var(--scrollbar-width-px)',
                border: `2px solid rgba(0, 0, 0, 0.2)`,
                zIndex: 10,
                pointerEvents: 'none',
            }
        })}
    >
        <div
            className={css({
                minHeight: '100%',
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 16,
                scrollbarColor: 'initial',
            })}
        >
            {children}
        </div>
    </div>;
};
