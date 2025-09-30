import type React from 'react';
import { useStorageGetSavePkms } from '../../data/sdk/storage/storage.gen';
import { StorageSaveItemBase } from '../../storage/storage-save-item-base';
import { useTranslate } from '../../translate/i18n';
import { StorageItem } from '../../ui/storage-item/storage-item';
import { TextContainer } from '../../ui/text-container/text-container';

export type PokedexDetailsOwnedProps = {
    saveId: number;
    species: number;
}

export const PokedexDetailsOwned: React.FC<PokedexDetailsOwnedProps> = ({ saveId, species }) => {
    const { t } = useTranslate();

    const savePkmsQuery = useStorageGetSavePkms(saveId);

    return <TextContainer maxHeight={300}>
        <div>{t('details.owned-save')}</div>

        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
        }}>
            {savePkmsQuery.isLoading && !savePkmsQuery.data && <StorageItem
                small
                species={species}
                form={0}
                helpTitle={null}
                loading
            />}

            {savePkmsQuery.data?.data
                .filter(pkm => pkm.species === species)
                .map(pkm =>
                    <StorageSaveItemBase
                        key={pkm.id}
                        saveId={pkm.saveId}
                        pkmId={pkm.id}
                        helpTitle={null}
                        small
                    />
                )}
        </div>
    </TextContainer>;
};
