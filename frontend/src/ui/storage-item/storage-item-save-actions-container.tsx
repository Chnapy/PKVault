import type React from 'react';
import { useStorageGetSavePkms } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { TitledContainer } from '../container/titled-container';
import { DetailsLevel } from '../details-card/details-level';
import { Icon } from '../icon/icon';

export const StorageItemSaveActionsContainer: React.FC<React.PropsWithChildren<{
    pkmId: string;
}>> = ({ pkmId, children }) => {
    const saveId = Route.useSearch({ select: (search) => search.save });

    const pkmSavePkmQuery = useStorageGetSavePkms(saveId ?? 0);

    const selectedPkm = pkmSavePkmQuery.data?.data.find(pkm => pkm.id === pkmId);
    if (!selectedPkm) {
        return null;
    }

    const { nickname, level } = selectedPkm;

    return <TitledContainer
        contrasted
        enableExpand
        title={<div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
        }}>
            <Icon name='angle-left' solid forButton />
            {nickname}{' '}
            <DetailsLevel level={level} />
        </div>}
    >
        {children}
    </TitledContainer>;
};
