import { Group } from '@mantine/core';
import type React from 'react';
import { HistoryContext } from '../../context/history-context';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { Gender, type PkmBaseDTO } from '../../data/sdk/model';
import { Route } from '../../routes';
import { UISpeciesImgSkeleton } from '../../ui-new/sprite-img/species-img/ui-species-img-skeleton';
import { UISpriteSizeWrapper } from '../../ui-new/sprite-img/ui-sprite-size-wrapper';
import { UIDetailsLevel } from '../../ui-new/storage/storage-details/ui-details-level';
import { UIStorageItemBase, type UIStorageItemBaseProps } from '../../ui-new/storage/storage-item/base/ui-storage-item-base';
import { SpeciesImg } from '../../ui/img/species-img';

export type PokedexDetailsOwnedProps = {
    saveId: number | null;
    species: number;
};

export const PokedexDetailsOwned: React.FC<PokedexDetailsOwnedProps> = ({ saveId, species }) => {
    const navigate = Route.useNavigate();

    const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

    const pkmsQuery = usePkmIndex(saveId, data => data.data.bySpecies[ species ]);

    const renderItem = (pkm: PkmBaseDTO, onClick: UIStorageItemBaseProps[ 'onClick' ]) => <UIStorageItemBase
        key={pkm.id}
        label={<>
            {pkm.nickname}
            <UIDetailsLevel level={pkm.level} showBar />
        </>}
        onClick={onClick}
    >
        <SpeciesImg species={species} context={pkm.context} form={pkm.form} isFemale={pkm.gender === Gender.Female}
            isShiny={pkm.isShiny} isEgg={pkm.isEgg} isShadow={pkm.isShadow} />
    </UIStorageItemBase>;

    return <UISpriteSizeWrapper component={Group}
        speciesSize='sm'
        itemSize='1lh'
    >
        {pkmsQuery.isPending && <UIStorageItemBase loading>
            <UISpeciesImgSkeleton />
        </UIStorageItemBase>}

        {pkmsQuery.data
            ?.filter(pkm => !('isMain' in pkm) || pkm.isMain)
            .map(pkm => {
                const onClick = saveId && 'saveId' in pkm
                    ? (() => navigate({
                        to: '/storage',
                        search: {
                            storages: [
                                storageHistoryValue?.search.storages?.[ 0 ] ?? { saveId: null },
                                { saveId, boxId: pkm.boxId },
                            ],
                            selected: {
                                storage: 1,
                                saveId,
                                id: pkm.id,
                            },
                        },
                    }))
                    : (() => navigate({
                        to: '/storage',
                        search: {
                            storages: [
                                {
                                    saveId: null,
                                    boxId: pkm.boxId,
                                },
                                storageHistoryValue?.search.storages?.[ 1 ],
                            ].filter(v => typeof v !== 'undefined'),
                            selected: {
                                storage: 0,
                                saveId: undefined,
                                id: pkm.id,
                            },
                        },
                    }));

                return renderItem(pkm, onClick);
            })}
    </UISpriteSizeWrapper>;
};
