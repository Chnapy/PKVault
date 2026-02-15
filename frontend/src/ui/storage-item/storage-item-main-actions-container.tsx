import type React from 'react';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { TitledContainer } from '../container/titled-container';
import { DetailsLevel } from '../details-card/details-level';
import { Icon } from '../icon/icon';
import { css } from '@emotion/css';
import { HelpButton } from '../../help/help-button';

export const StorageItemMainActionsContainer: React.FC<
    React.PropsWithChildren<{
        pkmId: string;
    }>
> = ({ pkmId, children }) => {
    const mainPkmVariantQuery = usePkmVariantIndex();

    const selectedPkm = mainPkmVariantQuery.data?.data.byId[ pkmId ];
    if (!selectedPkm) {
        return null;
    }

    const { nickname, level, isEnabled } = selectedPkm;

    const title = isEnabled && (
        <div
            className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            })}
        >
            <Icon name='angle-left' solid forButton />
            {nickname} <DetailsLevel level={level} />

            {children && <HelpButton
                slug='3-storage.md#actions-on-pokemons'
                className={css({
                    marginTop: -2,
                    marginBottom: -2,
                    marginLeft: 'auto',
                    border: 'none',
                })}
            />}
        </div>
    );

    return (
        (title || children) && (
            <TitledContainer contrasted expanded title={title}>
                {children}
            </TitledContainer>
        )
    );
};
