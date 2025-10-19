import React from 'react';
import { ErrorCatcher } from '../../error/error-catcher';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
import { theme } from '../theme';
import { Container, type ContainerProps } from './container';

export type TitledContainerProps = Omit<ContainerProps<'div'>, 'title'> & {
    title: React.ReactNode;
    contrasted?: boolean;
    enableExpand?: boolean;
    initialExpanded?: boolean;
    expanded?: boolean;
    maxHeight?: number;
};

export const TitledContainer: React.FC<React.PropsWithChildren<TitledContainerProps>> = ({
    title, contrasted, enableExpand, initialExpanded = true, expanded: rawExpanded, maxHeight, children, ...containerProps
}) => {
    const moveContext = StorageMoveContext.useValue();
    const isDragging = !!moveContext.selected && !moveContext.selected.target;
    const [ expandedRaw, setExpanded ] = React.useState(initialExpanded);

    let expanded = (!isDragging || !enableExpand)
        && expandedRaw;

    if (rawExpanded !== undefined) {
        expanded = rawExpanded;
    }

    return <Container
        {...containerProps}
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
            display: 'flex',
            flexDirection: 'column',
            ...containerProps.style,
        }}
    >
        <ErrorCatcher>
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
                    flexGrow: 1,
                    padding: 8,
                    overflowY: 'auto',
                    maxHeight,
                }}
            >
                {children}
            </div>}
        </ErrorCatcher>
    </Container>;
};
