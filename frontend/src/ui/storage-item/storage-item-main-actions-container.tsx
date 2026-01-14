import type React from 'react';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../../data/sdk/storage/storage.gen';
import { TitledContainer } from '../container/titled-container';
import { DetailsLevel } from '../details-card/details-level';
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
    const mainPkmVersion = pkmVersions.find(pk => pk.isMain);
    if (!mainPkmVersion) {
        return null;
    }
    const { nickname, level, isEnabled } = mainPkmVersion;

    const title = isEnabled && <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    }}>
        <Icon name='angle-left' solid forButton />
        {nickname}{' '}
        <DetailsLevel level={level} />
    </div>;

    return (title || children) && <TitledContainer
        contrasted
        enableExpand
        title={title}
    >
        {children}
    </TitledContainer>;
};
