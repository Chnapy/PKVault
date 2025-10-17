import { css } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from "react";
import { type PkmSaveDTO, type SaveInfosDTO } from "../data/sdk/model";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import {
  useStorageGetSaveBoxes,
  useStorageGetSavePkms,
} from "../data/sdk/storage/storage.gen";
import { Route } from "../routes/storage";
import { SaveItem } from '../saves/save-item/save-item';
import { useTranslate } from '../translate/i18n';
import { Button } from "../ui/button/button";
import { FilterSelect } from "../ui/filter/filter-select/filter-select";
import { Icon } from '../ui/icon/icon';
import { SaveCardImg } from '../ui/save-card/save-card-img';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageBoxSaveActions } from '../ui/storage-box/storage-box-save-actions';
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { theme } from '../ui/theme';
import { StorageMoveContext } from './actions/storage-move-context';
import { StorageSaveItem } from './storage-save-item';
import { StorageSelectAll } from './storage-select-all';
import { getSaveOrder } from './util/get-save-order';

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const { t } = useTranslate();

  const saveBoxId = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.saveBoxId });
  const saveOrder = Route.useSearch({ select: (search) => search.saves?.[ saveId ]?.order ?? 0 });
  const navigate = Route.useNavigate();

  const moveContext = StorageMoveContext.useValue();
  const isMoveDragging = !!moveContext.selected && !moveContext.selected.target;

  const saveInfosQuery = useSaveInfosGetAll();
  const saveInfos = saveInfosQuery.data?.data[ saveId ] as SaveInfosDTO | undefined;

  const saveBoxesQuery = useStorageGetSaveBoxes(saveId);
  const savePkmsQuery = useStorageGetSavePkms(saveId);

  const saveBoxes = saveBoxesQuery.data?.data ?? [];
  const savePkms = savePkmsQuery.data?.data ?? [];

  const selectedBoxIndex = saveBoxes.findIndex((box) => box.idInt === saveBoxId);
  const selectedBox = saveBoxes[ selectedBoxIndex ];

  if (!selectedBox || !saveInfos) {
    return null;
  }

  const previousBox = saveBoxes[ selectedBoxIndex - 1 ] ?? saveBoxes[ saveBoxes.length - 1 ];
  const nextBox = saveBoxes[ selectedBoxIndex + 1 ] ?? saveBoxes[ 0 ];

  const boxPkmsList = savePkms.filter((pkm) => pkm.boxId === selectedBox.idInt);

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
        header={
          <>
            <div
              className={css({
                flex: 1,
                '&:hover .save-item': {
                  opacity: '1 !important',
                },
              })}
            >
              <SaveCardImg
                version={saveInfos.version}
                size={24}
                borderWidth={2}
              />

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
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Button
                triggerOnHover={isMoveDragging}
                onClick={() =>
                  navigate({
                    search: ({ saves }) => ({
                      saves: {
                        ...saves,
                        [ saveId ]: {
                          saveId,
                          saveBoxId: previousBox.idInt,
                          order: getSaveOrder(saves, saveId),
                        }
                      }
                    }),
                  })
                }
                disabled={previousBox.id === selectedBox.id}
              >
                <Icon name='angle-left' forButton />
              </Button>

              <FilterSelect
                triggerOnHover={isMoveDragging}
                enabled={false}
                options={[
                  ...saveBoxes.map((box) => ({
                    value: box.id,
                    label: box.name,
                  })),
                ]}
                value={[ selectedBox.id ]}
                onChange={([ value ]) => {
                  navigate({
                    search: ({ saves }) => ({
                      saves: {
                        ...saves,
                        [ saveId ]: {
                          saveId,
                          saveBoxId: +value,
                          order: getSaveOrder(saves, saveId),
                        }
                      }
                    }),
                  });
                }}
              >
                {selectedBox.name}
              </FilterSelect>

              <Button
                triggerOnHover={isMoveDragging}
                onClick={() =>
                  navigate({
                    search: ({ saves }) => ({
                      saves: {
                        ...saves,
                        [ saveId ]: {
                          saveId,
                          saveBoxId: nextBox.idInt,
                          order: getSaveOrder(saves, saveId),
                        }
                      }
                    }),
                  })
                }
                disabled={nextBox.id === selectedBox.id}
              >
                <Icon name='angle-right' forButton />
              </Button>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8
              }}
            >
              <StorageSelectAll saveId={saveId} boxId={selectedBox.idInt} />

              <div style={{ display: 'flex', gap: 2 }}>
                <Icon name='folder' solid forButton />
                <span style={{ color: theme.text.primary }}>{boxPkmsList.length}</span>
                /{itemsCount} - {t('total')}.<span style={{ color: theme.text.primary }}>{savePkms.length}</span>
              </div>

              <Button
                onClick={() => navigate({
                  search: ({ saves }) => ({
                    selected: undefined,
                    saves: {
                      ...saves,
                      [ saveId ]: undefined,
                    },
                  })
                })}
              >
                <Icon name='times' forButton />
              </Button>
            </div>
          </>
        }
      >
        {allItems.map((pkm, i) => {
          if (!pkm
            || (moveContext.selected?.saveId === saveId
              && !moveContext.selected.target
              && moveContext.selected.ids.includes(pkm.id)
            )
          ) {
            return (
              <StorageItemPlaceholder
                key={i}
                saveId={saveId}
                boxId={selectedBox.idInt}
                boxSlot={i}
                pkmId={pkm?.id}
              />
            );
          }

          return <StorageSaveItem key={i} saveId={saveId} pkmId={pkm.id} />;
        })}

        {moveContext.selected?.saveId === saveId && !moveContext.selected.target && (
          moveContext.selected.ids.map(id => <StorageSaveItem key={id} saveId={saveId} pkmId={id} />)
        )}
      </PopoverButton>

      <StorageBoxSaveActions saveId={saveId} boxId={selectedBox.idInt} anchor={(saveOrder % 2) ? 'left start' : 'right start'} />
    </Popover>
  );
};
