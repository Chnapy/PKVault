import type React from 'react';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../../data/sdk/storage/storage.gen';
import { TitledContainer } from '../container/titled-container';
import { Icon } from '../icon/icon';

export const StorageItemMainActionsContainer: React.FC<React.PropsWithChildren<{
    pkmId: string;
}>> = ({ pkmId, children }) => {
    const mainPkmQuery = useStorageGetMainPkms();
    const mainPkmVersionQuery = useStorageGetMainPkmVersions();

    const selectedPkm = mainPkmQuery.data?.data.find(pkm => pkm.id === pkmId);
    if (!selectedPkm) {
        return null;
    }

    const pkmVersions = mainPkmVersionQuery.data?.data.filter(version => version.pkmId === selectedPkm.id) ?? [];
    if (pkmVersions.length === 0) {
        return null;
    }
    const { nickname, level } = pkmVersions[ 0 ];

    return <TitledContainer
        contrasted
        enableExpand
        title={<div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
        }}>
            <Icon name='angle-left' solid forButton />
            {nickname}{' Lv.'}{level}
        </div>}
    >
        {children}
    </TitledContainer>;
};
