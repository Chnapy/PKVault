import { css } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from "react";
import { BoxType, type PkmSaveDTO, type SaveInfosDTO } from "../data/sdk/model";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import {
  useStorageGetSaveBoxes,
  useStorageGetSavePkms,
} from "../data/sdk/storage/storage.gen";
import { withErrorCatcher } from '../error/with-error-catcher';
import { Route } from "../routes/storage";
import { SaveItem } from '../saves/save-item/save-item';
import type { DataOption } from '../ui/input/select-input';
import { SaveCardImg } from '../ui/save-card/save-card-img';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageBoxSaveActions } from '../ui/storage-box/storage-box-save-actions';
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { StorageMoveContext } from './actions/storage-move-context';
import { StorageHeader } from './box/storage-header';
import { StorageSaveItem } from './storage-save-item';
import { getSaveOrder } from './util/get-save-order';

export type StorageSaveBoxContentProps = {
  saveId: number;
  boxId: number;
  order: number;
  style?: React.CSSProperties;
};

export const StorageSaveBoxContent: React.FC<StorageSaveBoxContentProps> = withErrorCatcher('default', ({ saveId, boxId, order, style }) => {
  const saveBoxIds = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.saveBoxIds }) ?? [ 0 ];
  const navigate = Route.useNavigate();

  const boxIndex = saveBoxIds.indexOf(boxId);

  const getSaveBoxIds = (value: number) => saveBoxIds.map((id, i) => i === boxIndex ? value : id);

  const moveContext = StorageMoveContext.useValue();

  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfos = saveInfosQuery.data?.data[ saveId ] as SaveInfosDTO | undefined;

  const saveBoxesQuery = useStorageGetSaveBoxes(saveId);
  const savePkmsQuery = useStorageGetSavePkms(saveId);

  const loading = [ saveBoxesQuery, savePkmsQuery ].some(query => query.isLoading);

  const saveBoxes = saveBoxesQuery.data?.data ?? [];
  const savePkms = savePkmsQuery.data?.data ?? [];

  const filteredBoxes = saveBoxes.filter(box => !saveBoxIds.includes(box.idInt) || box.idInt === boxId);

  const selectedBoxIndex = filteredBoxes.findIndex((box) => box.idInt === boxId);
  const selectedBox = filteredBoxes[ selectedBoxIndex ]
    // placeholder box
    ?? {
    id: '-99',
    idInt: -99,
    name: '',
    type: BoxType.Box,
    slotCount: 30,
    canReceivePkm: false,
  };

  const previousBox = filteredBoxes[ selectedBoxIndex - 1 ] ?? filteredBoxes[ filteredBoxes.length - 1 ];
  const nextBox = filteredBoxes[ selectedBoxIndex + 1 ] ?? filteredBoxes[ 0 ];

  const boxPkmsList = selectedBox ? savePkms.filter((pkm) => pkm.boxId === selectedBox.idInt) : [];

  const boxPkms = Object.fromEntries(
    boxPkmsList.map((pkm) => [ pkm.boxSlot, pkm ])
  );

  const itemsCount = selectedBox.slotCount;

  const allItems = new Array(itemsCount)
    .fill(null)
    .map((_, i): PkmSaveDTO | null => boxPkms[ i ] ?? null);

  return (
    <Popover
      className={css({
        position: 'relative',
      })}
    >
      <PopoverButton
        as={StorageBox}
        style={style}
        loading={loading}
        header={<StorageHeader
          saveId={saveId}
          gameLogo={<div
            className={css({
              flex: 1,
              '&:hover .save-item': {
                opacity: '1 !important',
              },
            })}
          >
            {saveInfos && <SaveCardImg
              version={saveInfos.version}
              size={24}
              borderWidth={2}
            />}

            <div
              className='save-item'
              style={{
                position: 'absolute',
                top: 38,
                left: 6,
                zIndex: 5,
                opacity: 0,
                pointerEvents: 'none'
              }}
            >
              <SaveItem saveId={saveId} />
            </div>
          </div>}
          boxId={boxId}
          boxPkmCount={boxPkmsList.length}
          boxSlotCount={selectedBox.slotCount}
          totalPkmCount={savePkms.length}
          boxesOptions={saveBoxes.map((box): DataOption<string> => ({
            value: box.id,
            option: <div style={{ margin: '2px 4px' }}>
              {box.name}
            </div>,
            disabled: saveBoxIds.includes(box.idInt),
          }))}
          onBoxChange={(value) => navigate({
            search: ({ saves }) => ({
              saves: {
                ...saves,
                [ saveId ]: {
                  saveId,
                  saveBoxIds: getSaveBoxIds(+value),
                  order: getSaveOrder(saves, saveId),
                }
              }
            }),
          })}
          onPreviousBoxClick={!previousBox || previousBox.id === selectedBox.id
            ? undefined
            : () => navigate({
              search: ({ saves }) => ({
                saves: {
                  ...saves,
                  [ saveId ]: {
                    saveId,
                    saveBoxIds: getSaveBoxIds(previousBox.idInt),
                    order: getSaveOrder(saves, saveId),
                  }
                }
              }),
            })}
          onNextBoxClick={!nextBox || nextBox.id === selectedBox.id
            ? undefined
            : () => navigate({
              search: ({ saves }) => ({
                saves: {
                  ...saves,
                  [ saveId ]: {
                    saveId,
                    saveBoxIds: getSaveBoxIds(nextBox.idInt),
                    order: getSaveOrder(saves, saveId),
                  }
                }
              }),
            })}
          onSplitClick={saveBoxIds.length < 2 && nextBox && nextBox.id !== selectedBox.id
            ? () => navigate({
              search: ({ saves }) => ({
                saves: {
                  ...saves,
                  [ saveId ]: {
                    ...saves![ saveId ]!,
                    saveId,
                    saveBoxIds: [ boxId, nextBox.idInt ]
                  },
                },
              })
            })
            : undefined}
          onClose={() => navigate({
            search: ({ saves }) => ({
              saves: {
                ...saves,
                [ saveId ]: saveBoxIds.length > 1
                  ? {
                    ...saves![ saveId ]!,
                    saveBoxIds: saveBoxIds.filter(id => id !== boxId),
                  }
                  : undefined,
              },
            })
          })}
        />}
      >
        {allItems.map((pkm, i) => {
          return <div
            key={i}
            style={{ order: i, display: 'flex' }}
          >
            {!pkm
              || (moveContext.selected?.saveId === saveId
                && !moveContext.selected.target
                && moveContext.selected.ids.includes(pkm.id)
              )
              ? <StorageItemPlaceholder
                saveId={saveId}
                boxId={selectedBox.idInt}
                boxSlot={i}
                pkmId={pkm?.id}
              />
              : <StorageSaveItem key={i} saveId={saveId} pkmId={pkm.id} />}
          </div>;

        })}

        {moveContext.selected?.saveId === saveId && !moveContext.selected.target && (
          moveContext.selected.ids.map(id => <StorageSaveItem key={id} saveId={saveId} pkmId={id} />)
        )}
      </PopoverButton>

      <StorageBoxSaveActions saveId={saveId} boxId={selectedBox.idInt} anchor={(order % 2) ? 'left start' : 'right start'} />
    </Popover>
  );
});
