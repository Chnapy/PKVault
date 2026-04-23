import { css } from '@emotion/css';
import React from 'react';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { DetailsLevel } from '../details-card/details-level';
import { Icon } from '../icon/icon';
import { StorageActionsContainer } from './storage-actions-container';

export const StorageItemSaveActionsContainer: React.FC<
    React.PropsWithChildren<{
        saveId: number;
        pkmId: string;
    }>
> = ({ saveId, pkmId, children }) => {
    const pkmSavePkmQuery = usePkmSaveIndex(saveId);

    const selectedPkm = pkmSavePkmQuery.data?.data.byId[ pkmId ];
    if (!selectedPkm) {
        return null;
    }

    const { isEgg, nickname, level } = selectedPkm;

    return (
        <StorageActionsContainer
            type='item'
            title={
                <div
                    className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    })}
                >
                    <Icon name='angle-left' solid forButton />
                    {nickname} {!isEgg && <DetailsLevel level={level} />}
                </div>
            }
        >
            {children}
        </StorageActionsContainer>
    );
};
