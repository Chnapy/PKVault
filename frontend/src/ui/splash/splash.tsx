import type React from 'react';
import { Container } from '../container/container';
import { theme } from '../theme';
import { css } from '@emotion/css';

export const Splash: React.FC<React.PropsWithChildren> = ({ children }) => <div
    className={css({
        backgroundColor: theme.bg.contrast,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 16,
    })}
>
    <img
        src='/logo.svg'
        className={css({
            width: 128,
            height: 128,
        })}
    />

    {children && <Container padding='big' className={css({ maxWidth: '100%' })}>
        {children}
    </Container>}
</div>;
