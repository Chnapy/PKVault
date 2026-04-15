import { css } from '@emotion/css';
import type React from 'react';
import { ErrorCatcher } from '../../error/error-catcher';

export const DetailsCardWrapper: React.FC<{
    onClose: () => void;
    children: React.ReactNode;
}> = ({ onClose, children }) => (
    <div
        className={css({
            position: "fixed",
            bottom: 14,
            top: 60,
            left: 14,
            right: 14,
            pointerEvents: 'none',
            zIndex: 20,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            '&:hover': {
                zIndex: 25,
            },
            '& > *': {
                maxWidth: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                pointerEvents: 'initial',
            },
        })}
    >
        <ErrorCatcher
            className={css({ maxWidth: 700 })}
            onClose={onClose}
        >
            {children}
        </ErrorCatcher>
    </div>
);
