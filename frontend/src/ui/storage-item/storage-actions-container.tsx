import { css } from '@emotion/css';
import React from 'react';
import { TitledContainer, type TitledContainerProps } from '../container/titled-container';

type StorageActionsContainerProps = Pick<TitledContainerProps, 'title' | 'children'> & {
    type: 'item' | 'box';
};

export const StorageActionsContainer: React.FC<StorageActionsContainerProps> = ({
    type, title, children
}) => {

    return (
        <TitledContainer
            contrasted
            enableExpand
            title={title}
        >
            {React.Children.toArray(children).some(Boolean) && <div
                className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    maxWidth: type === 'item' ? 170 : undefined,
                    minWidth: type === 'box' ? 140 : undefined,
                })}
            >
                {children}
            </div>}
        </TitledContainer>
    );
};
