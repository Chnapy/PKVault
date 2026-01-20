import type React from 'react';
import { useStorageGetMainPkmVersions } from '../../data/sdk/storage/storage.gen';
import { TitledContainer } from '../container/titled-container';
import { DetailsLevel } from '../details-card/details-level';
import { Icon } from '../icon/icon';

export const StorageItemMainActionsContainer: React.FC<
    React.PropsWithChildren<{
        pkmId: string;
    }>
> = ({ pkmId, children }) => {
    const mainPkmVersionQuery = useStorageGetMainPkmVersions();

    const selectedPkm = mainPkmVersionQuery.data?.data.find(pkm => pkm.id === pkmId);
    if (!selectedPkm) {
        return null;
    }

    const { nickname, level, isEnabled } = selectedPkm;

    const title = isEnabled && (
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
    );

    return (
        (title || children) && (
            <TitledContainer contrasted enableExpand title={title}>
                {children}
            </TitledContainer>
        )
    );
};
