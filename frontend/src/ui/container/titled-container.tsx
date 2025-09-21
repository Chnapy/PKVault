import React from 'react';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { theme } from '../theme';
import { Container } from './container';

export type TitledContainerProps = {
    title: React.ReactNode;
    contrasted?: boolean;
    enableExpand?: boolean;
    initialExpanded?: boolean;
    maxHeight?: number;
};

export const TitledContainer: React.FC<React.PropsWithChildren<TitledContainerProps>> = ({
    title, contrasted, enableExpand, initialExpanded = true, maxHeight, children
}) => {
    const moveContext = StorageMoveContext.useValue();
    const isDragging = !!moveContext.selected && !moveContext.selected.target;
    const [ expandedRaw, setExpanded ] = React.useState(initialExpanded);

    const expanded = (!isDragging || !enableExpand)
        && expandedRaw;

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
            scrollbarColor: contrasted
                ? `${theme.bg.contrastdark} ${theme.bg.contrast}`
                : undefined,
        }}
    >
        {title && <div
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
        >{title}</div>}

        {children && expanded && <div
            style={{
                padding: 8,
                overflowY: 'auto',
                maxHeight,
            }}
        >
            {children}
        </div>}
    </Container>;
};
