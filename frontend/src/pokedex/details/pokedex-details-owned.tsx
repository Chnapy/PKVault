import type React from 'react';
import { HistoryContext } from '../../context/history-context';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { usePkmVersionIndex } from '../../data/hooks/use-pkm-version-index';
import { Route } from '../../routes';
import { BankContext } from '../../storage/bank/bank-context';
import { StorageMainItemBase } from '../../storage/storage-main-item-base';
import { StorageSaveItemBase } from '../../storage/storage-save-item-base';
import { getSaveOrder } from '../../storage/util/get-save-order';
import { useTranslate } from '../../translate/i18n';
import { StorageItem } from '../../ui/storage-item/storage-item';
import { TextContainer } from '../../ui/text-container/text-container';
import { SizingUtil } from '../../ui/util/sizing-util';
import { css } from '@emotion/css';

export type PokedexDetailsOwnedProps = {
    saveId: number;
    species: number;
};

export const PokedexDetailsOwned: React.FC<PokedexDetailsOwnedProps> = ({ saveId, species }) => {
    const { t } = useTranslate();
    const navigate = Route.useNavigate();

    const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];
    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const storageSearch = storageHistoryValue?.search ?? selectedBankBoxes.data?.selectedSearch;

    const savePkmsQuery = usePkmSaveIndex(saveId);
    const pkmVersionsQuery = usePkmVersionIndex();

    return (
        <TextContainer maxHeight={300}>
            <div>{t('details.owned-save')}</div>

            <div
                className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: SizingUtil.itemsGap,
                })}
            >
                {saveId === 0 ? (
                    <>
                        {pkmVersionsQuery.isLoading && !pkmVersionsQuery.data && (
                            <StorageItem small species={species} context={9} form={0} helpTitle={null} loading />
                        )}

                        {pkmVersionsQuery.data?.data.bySpecies[ species ]
                            ?.filter(pkm => pkm.isMain)
                            ?.map(pkmVersion => (
                                <StorageMainItemBase
                                    key={pkmVersion.id}
                                    pkmId={pkmVersion.id}
                                    helpTitle={null}
                                    small
                                    onClick={() =>
                                        navigate({
                                            to: '/storage',
                                            search: {
                                                ...storageSearch,
                                                mainBoxIds: [ pkmVersion?.boxId ?? 0 ],
                                                selected: {
                                                    saveId: undefined,
                                                    id: pkmVersion.id,
                                                },
                                            },
                                        })
                                    }
                                />
                            ))}
                    </>
                ) : (
                    <>
                        {savePkmsQuery.isLoading && !savePkmsQuery.data && (
                            <StorageItem small species={species} context={9} form={0} helpTitle={null} loading />
                        )}

                        {savePkmsQuery.data?.data.bySpecies[ species ]?.map(pkm => (
                            <StorageSaveItemBase
                                key={pkm.id}
                                saveId={pkm.saveId}
                                pkmId={pkm.id}
                                helpTitle={null}
                                small
                                onClick={() =>
                                    navigate({
                                        to: '/storage',
                                        search: {
                                            ...storageSearch,
                                            saves: {
                                                ...storageSearch?.saves,
                                                [ saveId ]: {
                                                    saveId,
                                                    saveBoxIds: [ pkm.boxId ],
                                                    order: getSaveOrder(storageSearch?.saves, saveId),
                                                },
                                            },
                                            selected: {
                                                saveId,
                                                id: pkm.id,
                                            },
                                        },
                                    })
                                }
                            />
                        ))}
                    </>
                )}
            </div>
        </TextContainer>
    );
};
