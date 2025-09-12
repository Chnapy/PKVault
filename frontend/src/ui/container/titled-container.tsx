import type React from 'react';
import { Container } from './container';
import { theme } from '../theme';

export type TitledContainerProps = {
    title: React.ReactNode;
    contrasted?: boolean;
};

export const TitledContainer: React.FC<React.PropsWithChildren<TitledContainerProps>> = ({ title, contrasted, children }) => {

    return <Container
        style={{
            backgroundColor: contrasted
                ? theme.bg.contrast
                : theme.bg.panel,
            borderColor: contrasted
                ? theme.border.contrast
                : undefined,
            color: contrasted
                ? theme.text.light
                : theme.text.default,
        }}
    >
        <div
            style={{
                backgroundColor: contrasted
                    ? theme.bg.contrastdark
                    : theme.bg.light,
                padding: 4,
                borderRadius: 2,
            }}
        >{title}</div>

        <div
            style={{
                padding: 4,
            }}
        >
            {children}
        </div>
    </Container>;
};
