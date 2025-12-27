import type React from 'react';
import { HistoryContext } from '../../context/history-context';
import { useStorageGetSavePkms } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes';
import { BankContext } from '../../storage/bank/bank-context';
import { StorageSaveItemBase } from '../../storage/storage-save-item-base';
import { getSaveOrder } from '../../storage/util/get-save-order';
import { useTranslate } from '../../translate/i18n';
import { StorageItem } from '../../ui/storage-item/storage-item';
import { TextContainer } from '../../ui/text-container/text-container';
import { SizingUtil } from '../../ui/util/sizing-util';

export type PokedexDetailsOwnedProps = {
    saveId: number;
    species: number;
}

export const PokedexDetailsOwned: React.FC<PokedexDetailsOwnedProps> = ({ saveId, species }) => {
    const { t } = useTranslate();
    const navigate = Route.useNavigate();

    const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];
    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const storageSearch = storageHistoryValue?.search ?? selectedBankBoxes.data?.selectedSearch;

    const savePkmsQuery = useStorageGetSavePkms(saveId);

    const pkmList = savePkmsQuery.data?.data.filter(pkm => pkm.species === species);

    if (!savePkmsQuery.isLoading && pkmList && pkmList.length === 0) {
        console.log('Pkm not found, saveId/species:', saveId, species)
    }

    return <TextContainer maxHeight={300}>
        <div>{t('details.owned-save')}</div>

        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: SizingUtil.itemsGap,
        }}>
            {savePkmsQuery.isLoading && !savePkmsQuery.data && <StorageItem
                small
                species={species}
                context={9}
                form={0}
                helpTitle={null}
                loading
            />}

            {pkmList?.map(pkm =>
                <StorageSaveItemBase
                    key={pkm.id}
                    saveId={pkm.saveId}
                    pkmId={pkm.id}
                    helpTitle={null}
                    small
                    onClick={() => navigate({
                        to: '/storage',
                        search: {
                            ...storageSearch,
                            saves: {
                                ...storageSearch?.saves,
                                [ saveId ]: {
                                    saveId,
                                    saveBoxIds: [ pkm.boxId ],
                                    order: getSaveOrder(storageSearch?.saves, saveId),
                                }
                            },
                            selected: {
                                saveId,
                                id: pkm.id,
                            },
                        },
                    })}
                />
            )}
        </div>
    </TextContainer>;
};
