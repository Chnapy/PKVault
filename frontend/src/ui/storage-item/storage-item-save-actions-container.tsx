import type React from 'react';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { TitledContainer } from '../container/titled-container';
import { DetailsLevel } from '../details-card/details-level';
import { Icon } from '../icon/icon';

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

    const { nickname, level } = selectedPkm;

    return (
        <TitledContainer
            contrasted
            enableExpand
            title={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}
                >
                    <Icon name='angle-left' solid forButton />
                    {nickname} <DetailsLevel level={level} />
                </div>
            }
        >
            {children}
        </TitledContainer>
    );
};
