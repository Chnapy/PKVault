import { css } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from 'react';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { BoxType, type PkmVariantDTO } from '../../../data/sdk/model';
import { useStorageCreateMainBox, useStorageDeleteMainBox, useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { HelpButton } from '../../../help/help-button';
import { Route } from '../../../routes/storage';
import { useTranslate } from '../../../translate/i18n';
import { Icon } from '../../../ui/icon/icon';
import { StorageBox } from '../../../ui/storage-box/storage-box';
import { StorageBoxMainActions } from '../../../ui/storage-box/storage-box-main-actions';
import { StorageItemPlaceholder } from '../../../ui/storage-item/storage-item-placeholder';
import { StorageMoveContext } from '../../actions/storage-move-context';
import { DexSyncAdvancedAction } from '../../advanced-actions/dex-sync-advanced-action';
import { SortAdvancedAction } from '../../advanced-actions/sort-advanced-action';
import { BankContext } from '../../bank/bank-context';
import { StorageMainItem } from '../../item/main/storage-main-item';
import { StorageBoxEdit } from '../storage-box-edit';
import { StorageBoxList } from '../storage-box-list';
import { StorageHeader } from '../storage-header';

export const StorageMainBoxContent: React.FC<{
    boxId: number;
    className?: string;
}> = withErrorCatcher('default', ({ boxId, className }) => {
    const [ showBoxes, setShowBoxes ] = React.useState(false);

    const { t } = useTranslate();
    const navigate = Route.useNavigate();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];

    const boxIndex = mainBoxIds.indexOf(boxId);

    const getMainBoxIds = (value: number) => mainBoxIds.map((id, i) => (i === boxIndex ? value : id));

    const moveContext = StorageMoveContext.useValue();

    const boxesQuery = useStorageGetBoxes();
    const pkmsQuery = usePkmVariantIndex();

    const loading = [ pkmsQuery, selectedBankBoxes ].some(query => query.isLoading);

    const boxCreateMutation = useStorageCreateMainBox();
    const boxDeleteMutation = useStorageDeleteMainBox();

    const boxes = boxesQuery.data?.data.filter(box => box.bankId === selectedBankBoxes.data?.selectedBank.id) ?? [];
    const sortedBoxes = boxes.sort((b1, b2) => (b1.order < b2.order ? -1 : 1));
    const filteredBoxes = sortedBoxes.filter(box => !mainBoxIds.includes(box.idInt) || box.idInt === boxId);
    const pkms = Object.values(pkmsQuery.data?.data.byId ?? {}).filter(pk => pk.isMain);

    const selectedBoxIndex = filteredBoxes.findIndex(box => box.idInt === boxId);
    const selectedBox = filteredBoxes[ selectedBoxIndex ] ?? {
        id: '-99',
        idInt: -99,
        name: '',
        type: BoxType.Box,
        slotCount: 30,
        canReceivePkm: false,
    };

    const previousBox = filteredBoxes[ selectedBoxIndex - 1 ] ?? filteredBoxes[ filteredBoxes.length - 1 ];
    const nextBox = filteredBoxes[ selectedBoxIndex + 1 ] ?? filteredBoxes[ 0 ];

    const boxPkmsList = Object.values(pkmsQuery.data?.data.byBox[ selectedBox.idInt ] ?? {})
        .flat()
        .filter(pkm => pkm.isMain);

    const boxPkms = Object.fromEntries(boxPkmsList.map(pkm => [ pkm.boxSlot, pkm ]));

    const allItems = new Array(selectedBox.slotCount).fill(null).map((_, i): PkmVariantDTO | null => boxPkms[ i ] ?? null);

    return (
        <Popover
            className={css({
                position: 'relative',
            })}
        >
            <PopoverButton
                as={StorageBox}
                loading={loading}
                slotCount={selectedBox.slotCount}
                className={className}
                header={
                    <>
                        <StorageHeader
                            gameLogo={
                                <div
                                    className={css({
                                        flex: 1,
                                        alignItems: 'center',
                                    })}
                                >
                                    <img
                                        src='/logo.svg'
                                        className={css({
                                            display: 'block',
                                            height: 24,
                                            width: 24,
                                        })}
                                    />
                                </div>
                            }
                            boxId={boxId}
                            boxType={selectedBox.type}
                            boxName={selectedBox.name}
                            boxPkmCount={boxPkmsList.length}
                            boxSlotCount={selectedBox.slotCount}
                            totalPkmCount={pkms.length}
                            showBoxes={showBoxes}
                            advancedActions={[
                                {
                                    label: t('storage.box.advanced.sort'),
                                    icon: <Icon name='sort' solid forButton />,
                                    panelContent: close => <SortAdvancedAction.Main selectedBoxId={selectedBox.idInt} close={close} />,
                                },
                                {
                                    label: t('storage.box.advanced.dex-sync'),
                                    icon: <Icon name='table' solid forButton />,
                                    panelContent: close => <DexSyncAdvancedAction saveId={0} close={close} />,
                                },
                            ]}
                            onBoxesDisplay={() => setShowBoxes(value => !value)}
                            onPreviousBoxClick={
                                !previousBox || previousBox.id === selectedBox.id
                                    ? undefined
                                    : () =>
                                        navigate({
                                            search: {
                                                mainBoxIds: getMainBoxIds(previousBox.idInt),
                                            },
                                        })
                            }
                            onNextBoxClick={
                                !nextBox || nextBox.id === selectedBox.id
                                    ? undefined
                                    : () =>
                                        navigate({
                                            search: {
                                                mainBoxIds: getMainBoxIds(nextBox.idInt),
                                            },
                                        })
                            }
                            onSplitClick={
                                mainBoxIds.length < 2 && nextBox && nextBox.id !== selectedBox.id
                                    ? () =>
                                        navigate({
                                            search: () => ({
                                                mainBoxIds: [ boxId, nextBox.idInt ],
                                            }),
                                        })
                                    : undefined
                            }
                            onClose={
                                mainBoxIds.length > 1
                                    ? () =>
                                        navigate({
                                            search: () => ({
                                                mainBoxIds: mainBoxIds.filter(id => id !== boxId),
                                            }),
                                        })
                                    : undefined
                            }
                        />

                        {showBoxes && (
                            <StorageBoxList
                                selectedBoxes={mainBoxIds}
                                boxes={boxes}
                                pkms={pkms.map(pkm => ({
                                    id: pkm.id,
                                    boxId: pkm.boxId,
                                    boxSlot: pkm.boxSlot,
                                }))}
                                onBoxChange={value => {
                                    if (!mainBoxIds.includes(value)) {
                                        navigate({
                                            search: {
                                                mainBoxIds: getMainBoxIds(Number(value)),
                                            },
                                        });
                                    }
                                    setShowBoxes(false);
                                }}
                                editPanelContent={(boxId, close) => <StorageBoxEdit boxId={boxId} close={close} />}
                                deleteFn={boxId => boxDeleteMutation.mutateAsync({ boxId })}
                                addFn={
                                    selectedBankBoxes.data &&
                                    (() =>
                                        boxCreateMutation.mutateAsync({
                                            params: {
                                                bankId: selectedBankBoxes.data.selectedBank.id,
                                            },
                                        }))
                                }
                                help={<HelpButton slug='3-storage.md#banks-and-boxes' />}
                            />
                        )}
                    </>
                }
            >
                {!showBoxes && (
                    <>
                        {allItems.map((pkm, i) => {
                            return (
                                <div key={i} className={css({ order: i, display: 'flex' })}>
                                    {!pkm ||
                                        (moveContext.selected &&
                                            !moveContext.selected.saveId &&
                                            !moveContext.selected.target &&
                                            moveContext.selected.ids.includes(pkm.id)) ? (
                                        <StorageItemPlaceholder boxId={selectedBox.idInt} boxSlot={i} pkmId={pkm?.id} />
                                    ) : (
                                        <StorageMainItem pkmId={pkm.id} />
                                    )}
                                </div>
                            );
                        })}

                        {moveContext.selected &&
                            !moveContext.selected.saveId &&
                            !moveContext.selected.target &&
                            moveContext.selected.ids.map(id => <StorageMainItem key={id} pkmId={id} />)}
                    </>
                )}
            </PopoverButton>

            <StorageBoxMainActions boxId={selectedBox.idInt} anchor={'right start'} />
        </Popover>
    );
});
