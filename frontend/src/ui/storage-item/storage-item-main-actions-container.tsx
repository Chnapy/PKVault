import type React from 'react';
import { usePkmVersionIndex } from '../../data/hooks/use-pkm-version-index';
import { TitledContainer } from '../container/titled-container';
import { DetailsLevel } from '../details-card/details-level';
import { Icon } from '../icon/icon';

export const StorageItemMainActionsContainer: React.FC<
    React.PropsWithChildren<{
        pkmId: string;
    }>
> = ({ pkmId, children }) => {
    const mainPkmVersionQuery = usePkmVersionIndex();

    const selectedPkm = mainPkmVersionQuery.data?.data.byId[ pkmId ];
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
