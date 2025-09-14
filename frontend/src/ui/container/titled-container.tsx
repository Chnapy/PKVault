import React from 'react';
import { Container } from './container';
import { theme } from '../theme';

export type TitledContainerProps = {
    title: React.ReactNode;
    contrasted?: boolean;
    enableExpand?: boolean;
    initialExpanded?: boolean;
};

export const TitledContainer: React.FC<React.PropsWithChildren<TitledContainerProps>> = ({
    title, contrasted, enableExpand, initialExpanded = true, children
}) => {
    const [ expanded, setExpanded ] = React.useState(initialExpanded);

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
            role={enableExpand ? 'button' : undefined}
            onClick={enableExpand ? (() => setExpanded(!expanded)) : undefined}
            style={{
                backgroundColor: contrasted
                    ? theme.bg.contrastdark
                    : theme.bg.light,
                padding: 4,
                borderRadius: 2,
                cursor: enableExpand ? 'pointer' : undefined,
                userSelect: enableExpand ? 'none' : undefined,
            }}
        >{title}</div>

        <div
            style={{
                padding: expanded ? 4 : 0,
                height: expanded ? undefined : 0,
                overflow: expanded ? undefined : 'hidden',
            }}
        >
            {children}
        </div>
    </Container>;
};
