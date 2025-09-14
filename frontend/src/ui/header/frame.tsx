import type React from 'react';
import { theme } from '../theme';
import { css } from '@emotion/css';

export const Frame: React.FC<React.PropsWithChildren> = ({ children }) => {

    return <div
        className={css({
            position: 'relative',
            height: "100vh",
            overflowY: 'scroll',
            scrollbarColor: `${theme.bg.contrastdark} ${theme.bg.contrast}`,
            border: `10px solid ${theme.bg.contrast}`,
            borderRight: 'none',
            backgroundColor: theme.bg.app,
            backgroundImage: `radial-gradient(${theme.bg.appdark} 4px, ${theme.bg.app} 4px)`,
            backgroundSize: '40px 40px',

            '&::before': {
                content: '""',
                position: 'fixed',
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
                border: `2px solid rgba(0, 0, 0, 0.2)`,
                zIndex: 10,
                pointerEvents: 'none',
            }
        })}
    >
        <div
            style={{
                minHeight: '100%',
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 16,
                scrollbarColor: 'initial',
            }}
        >
            {/* <div style={{ height: 1600 }} /> */}
            {children}
        </div>
    </div>;
};
