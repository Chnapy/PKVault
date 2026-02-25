import { css, cx } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from 'react';
import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { BoxType, type PkmSaveDTO, type SaveInfosDTO } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { Route } from '../../../routes/storage';
import { SaveItem } from '../../../saves/save-item/save-item';
import { useTranslate } from '../../../translate/i18n';
import { Icon } from '../../../ui/icon/icon';
import { SaveCardImg } from '../../../ui/save-card/save-card-img';
import { StorageBox } from '../../../ui/storage-box/storage-box';
import { StorageBoxSaveActions } from '../../../ui/storage-box/storage-box-save-actions';
import { StorageItemPlaceholder } from '../../../ui/storage-item/storage-item-placeholder';
import { SizingUtil } from '../../../ui/util/sizing-util';
import { DexSyncAdvancedAction } from '../../advanced-actions/dex-sync-advanced-action';
import { SortAdvancedAction } from '../../advanced-actions/sort-advanced-action';
import { StorageSaveItem } from '../../item/save/storage-save-item';
import { MoveContext } from '../../move/context/move-context';
import { getSaveOrder } from '../../util/get-save-order';
import { StorageBoxList } from '../storage-box-list';
import { StorageHeader } from '../storage-header';

export type StorageSaveBoxContentProps = {
  saveId: number;
  boxId: number;
  order: number;
  className?: string;
};

export const StorageSaveBoxContent: React.FC<StorageSaveBoxContentProps> = withErrorCatcher('default', ({ saveId, boxId, order, className }) => {
  const [ showBoxes, setShowBoxes ] = React.useState(false);

  const { t } = useTranslate();

  const saveBoxIds = Route.useSearch({ select: search => search.saves?.[ saveId ]?.saveBoxIds }) ?? [ 0 ];
  const navigate = Route.useNavigate();

  const boxIndex = saveBoxIds.indexOf(boxId);

  const getSaveBoxIds = (value: number) => saveBoxIds.map((id, i) => (i === boxIndex ? value : id));

  const moveState = MoveContext.useValue().state;

  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfos = saveInfosQuery.data?.data[ saveId ] as SaveInfosDTO | undefined;

  const saveBoxesQuery = useStorageGetBoxes({ saveId });
  const savePkmsQuery = usePkmSaveIndex(saveId);

  const loading = [ saveBoxesQuery, savePkmsQuery ].some(query => query.isLoading);

  const saveBoxes = saveBoxesQuery.data?.data ?? [];
  const savePkms = Object.values(savePkmsQuery.data?.data.byId ?? {});

  const maxBoxSlotCount = Math.max(0, ...saveBoxes.map(box => box.slotCount));

  const filteredBoxes = saveBoxes.filter(box => !saveBoxIds.includes(box.idInt) || box.idInt === boxId).sort((b1, b2) => (b1.order < b2.order ? -1 : 1));

  const selectedBoxIndex = filteredBoxes.findIndex(box => box.idInt === boxId);
  const selectedBox = filteredBoxes[ selectedBoxIndex ] ??
  // placeholder box
  {
    id: '-99',
    idInt: -99,
    name: '',
    type: BoxType.Box,
    slotCount: maxBoxSlotCount || 30,
    canReceivePkm: false,
  };

  const boxSlotCount = selectedBox.slotCount;
  const nbrItemsPerLine = SizingUtil.getItemsPerLine(boxSlotCount);

  const previousBox = filteredBoxes[ selectedBoxIndex - 1 ] ?? filteredBoxes[ filteredBoxes.length - 1 ];
  const nextBox = filteredBoxes[ selectedBoxIndex + 1 ] ?? filteredBoxes[ 0 ];

  const boxPkms = selectedBox ? (savePkmsQuery.data?.data.byBox[ selectedBox.idInt ] ?? {}) : {};
  const boxPkmsList = Object.values(boxPkms);

  const itemsCount = selectedBox.slotCount;

  const allItems = new Array(itemsCount).fill(null).map((_, i): PkmSaveDTO | null => boxPkms[ i ] ?? null);

  return (
    <Popover
      className={css({
        position: 'relative',
      })}
    >
      <PopoverButton
        as={StorageBox}
        className={className}
        slotCount={selectedBox.slotCount}
        lineSlotCount={nbrItemsPerLine}
        loading={loading}
        header={
          <>
            <StorageHeader
              saveId={saveId}
              gameLogo={
                <div
                  className={css({
                    flex: 1,
                    '&:hover .save-item': {
                      opacity: '1 !important',
                    },
                  })}
                >
                  {saveInfos && <SaveCardImg version={saveInfos.version} size={24} borderWidth={2} />}

                  <div
                    className={cx('save-item', css({
                      position: 'absolute',
                      top: 38,
                      left: 6,
                      zIndex: 5,
                      opacity: 0,
                      pointerEvents: 'none',
                    }))}
                  >
                    <SaveItem saveId={saveId} />
                  </div>
                </div>
              }
              boxId={boxId}
              boxType={selectedBox.type}
              boxName={selectedBox.name}
              boxPkmCount={boxPkmsList.length}
              boxSlotCount={selectedBox.slotCount}
              totalPkmCount={savePkms.length}
              showBoxes={showBoxes}
              advancedActions={[
                {
                  label: t('storage.box.advanced.sort'),
                  icon: <Icon name='sort' solid forButton />,
                  panelContent: close => <SortAdvancedAction.Save saveId={saveId} selectedBoxId={selectedBox.idInt} close={close} />,
                },
                {
                  label: t('storage.box.advanced.dex-sync'),
                  icon: <Icon name='table' solid forButton />,
                  panelContent: close => <DexSyncAdvancedAction saveId={saveId} close={close} />,
                },
              ]}
              onBoxesDisplay={() => setShowBoxes(value => !value)}
              onPreviousBoxClick={
                !previousBox || previousBox.id === selectedBox.id
                  ? undefined
                  : () =>
                    navigate({
                      search: ({ saves }) => ({
                        saves: {
                          ...saves,
                          [ saveId ]: {
                            saveId,
                            saveBoxIds: getSaveBoxIds(previousBox.idInt),
                            order: getSaveOrder(saves, saveId),
                          },
                        },
                      }),
                    })
              }
              onNextBoxClick={
                !nextBox || nextBox.id === selectedBox.id
                  ? undefined
                  : () =>
                    navigate({
                      search: ({ saves }) => ({
                        saves: {
                          ...saves,
                          [ saveId ]: {
                            saveId,
                            saveBoxIds: getSaveBoxIds(nextBox.idInt),
                            order: getSaveOrder(saves, saveId),
                          },
                        },
                      }),
                    })
              }
              onSplitClick={
                saveBoxIds.length < 2 && nextBox && nextBox.id !== selectedBox.id
                  ? () =>
                    navigate({
                      search: ({ saves }) => ({
                        saves: {
                          ...saves,
                          [ saveId ]: {
                            ...saves![ saveId ]!,
                            saveId,
                            saveBoxIds: [ boxId, nextBox.idInt ],
                          },
                        },
                      }),
                    })
                  : undefined
              }
              onClose={() =>
                navigate({
                  search: ({ saves }) => ({
                    saves: {
                      ...saves,
                      [ saveId ]:
                        saveBoxIds.length > 1
                          ? {
                            ...saves![ saveId ]!,
                            saveBoxIds: saveBoxIds.filter(id => id !== boxId),
                          }
                          : undefined,
                    },
                  }),
                })
              }
            />

            {showBoxes && (
              <StorageBoxList
                selectedBoxes={saveBoxIds}
                boxes={saveBoxes}
                pkms={savePkms.map(pkm => ({
                  id: pkm.id,
                  boxId: pkm.boxId,
                  boxSlot: pkm.boxSlot,
                }))}
                onBoxChange={value => {
                  if (!saveBoxIds.includes(value)) {
                    navigate({
                      search: ({ saves }) => ({
                        saves: {
                          ...saves,
                          [ saveId ]: {
                            saveId,
                            saveBoxIds: getSaveBoxIds(+value),
                            order: getSaveOrder(saves, saveId),
                          },
                        },
                      }),
                    });
                  }
                  setShowBoxes(false);
                }}
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
                    (moveState.status === 'dragging' &&
                      moveState.source.saveId === saveId &&
                      moveState.source.ids.includes(pkm.id))
                    ? (
                      <StorageItemPlaceholder saveId={saveId} boxId={selectedBox.idInt} boxSlot={i} pkmId={pkm?.id} />
                    ) : (
                      <StorageSaveItem key={i} saveId={saveId} pkmId={pkm.id} />
                    )}
                </div>
              );
            })}

            {moveState.status === 'dragging' &&
              moveState.source.saveId === saveId &&
              moveState.source.ids.map(id => <StorageSaveItem key={id} saveId={saveId} pkmId={id} />)}
          </>
        )}
      </PopoverButton>

      <StorageBoxSaveActions saveId={saveId} boxId={selectedBox.idInt} anchor={order % 2 ? 'left start' : 'right start'} />
    </Popover>
  );
});
