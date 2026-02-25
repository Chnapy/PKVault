import { css, cx } from '@emotion/css';
import React from 'react';
import { ErrorCatcher } from '../../error/error-catcher';
import { MoveContext } from '../../storage/move/context/move-context';
import { theme } from '../theme';
import { Container, type ContainerProps } from './container';

export type TitledContainerProps = Omit<ContainerProps<'div'>, 'title'> & {
    title: React.ReactNode;
    contrasted?: boolean;
    enableExpand?: boolean;
    initialExpanded?: boolean;
    expanded?: boolean;
    setExpanded?: (value: boolean) => void;
    maxHeight?: number;
};

export const TitledContainer: React.FC<React.PropsWithChildren<TitledContainerProps>> = ({
    title, contrasted, enableExpand, initialExpanded = true, expanded: rawExpanded, setExpanded, maxHeight, children, ...containerProps
}) => {
    const isDragging = MoveContext.useValue().state.status === 'dragging';
    const [ expandedRaw, setExpandedRaw ] = React.useState(initialExpanded);

    let expanded = (!isDragging || !enableExpand)
        && expandedRaw;

    if (rawExpanded !== undefined) {
        expanded = rawExpanded;
    }

    setExpanded ??= setExpandedRaw;

    return <Container
        {...containerProps}
        className={cx(css({
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
                : 'initial',
            display: 'flex',
            flexDirection: 'column',
        }), containerProps.className)}
    >
        <ErrorCatcher>
            {title && <div
                role={enableExpand ? 'button' : undefined}
                onClick={enableExpand ? (() => setExpanded(!expanded)) : undefined}
                className={css({
                    backgroundColor: contrasted
                        ? theme.bg.contrastdark
                        : theme.bg.light,
                    padding: 4,
                    borderRadius: 2,
                    cursor: enableExpand ? 'pointer' : undefined,
                    userSelect: enableExpand ? 'none' : undefined,
                })}
            >{title}</div>}

            {children && expanded && <div
                className={css({
                    flexGrow: 1,
                    padding: 8,
                    overflowY: 'auto',
                    maxHeight,
                })}
            >
                {children}
            </div>}
        </ErrorCatcher>
    </Container>;
};
