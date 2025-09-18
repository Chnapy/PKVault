import React from "react";
import { type PkmSaveDTO, type SaveInfosDTO } from "../data/sdk/model";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import {
  useStorageGetSaveBoxes,
  useStorageGetSavePkms,
} from "../data/sdk/storage/storage.gen";
import { Route } from "../routes/storage";
import { Button } from "../ui/button/button";
import { FilterSelect } from "../ui/filter/filter-select/filter-select";
import { Icon } from '../ui/icon/icon';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { theme } from '../ui/theme';
import { switchUtil } from '../util/switch-util';
import { StorageMoveContext } from './actions/storage-move-context';
import { StorageSaveItem } from './storage-save-item';

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const saveBoxId = Route.useSearch({ select: (search) => search.saveBoxId });
  const navigate = Route.useNavigate();

  const moveContext = StorageMoveContext.useValue();
  const isMoveDragging = !!moveContext.selected && !moveContext.selected.target;

  const saveInfosRecord = useSaveInfosGetAll().data?.data ?? {};
  const saveInfos = saveInfosRecord[ saveId ] as SaveInfosDTO | undefined;

  const saveBoxesQuery = useStorageGetSaveBoxes(saveId);
  const savePkmsQuery = useStorageGetSavePkms(saveId);

  const saveBoxes = saveBoxesQuery.data?.data ?? [];
  const savePkms = savePkmsQuery.data?.data ?? [];

  // const defaultBoxes = saveBoxes.filter(box => box.type === BoxType.Default);
  // const partyBox = saveBoxes.find(box => box.type === BoxType.Party);
  // const daycareBox = saveBoxes.find(box => box.type === BoxType.Daycare);

  const selectedBoxIndex =
    saveBoxId
      ? saveBoxes.findIndex((box) => box.id === saveBoxId)
      : 0;
  const selectedBox = saveBoxes[ selectedBoxIndex ];

  if (!selectedBox || !saveInfos) {
    return null;
  }

  const previousBox = saveBoxes[ selectedBoxIndex - 1 ] ?? saveBoxes[ saveBoxes.length - 1 ];
  const nextBox = saveBoxes[ selectedBoxIndex + 1 ] ?? saveBoxes[ 0 ];

  const boxPkmsList = savePkms.filter((pkm) => pkm.box === selectedBox.idInt);

  const boxPkms = Object.fromEntries(
    boxPkmsList.map((pkm) => [ pkm.boxSlot, pkm ])
  );

  const itemsCount = switchUtil(selectedBox.idInt, {
    [ -1 ]: 6,
    [ -2 ]: saveInfos.daycareCount,
  }) as number | undefined ?? saveInfos.boxSlotCount;

  const allItems = new Array(itemsCount)
    .fill(null)
    .map((_, i): PkmSaveDTO | null => boxPkms[ i ] ?? null);

  return (
    <StorageBox
      header={
        <>
          <div
            style={{
              flex: 1,
            }}
          >
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
                  search: {
                    saveBoxId: previousBox.id,
                  },
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
                  search: {
                    saveBoxId: value,
                  },
                });
              }}
            >
              {selectedBox.name}
            </FilterSelect>

            <Button
              triggerOnHover={isMoveDragging}
              onClick={() =>
                navigate({
                  search: {
                    saveBoxId: nextBox.id,
                  },
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
              justifyContent: 'flex-end',
              gap: 2
            }}
          >
            <Icon name='folder' solid forButton />
            <span style={{ color: theme.text.primary }}>{boxPkmsList.length}</span>
            /{itemsCount} - Total.<span style={{ color: theme.text.primary }}>{savePkms.length}</span>
          </div>
        </>
      }
    >
      {allItems.map((pkm, i) => {
        if (!pkm
          || (moveContext.selected?.storageType === 'save'
            && !moveContext.selected.target
            && moveContext.selected.id === pkm.id
          )
        ) {
          return (
            <StorageItemPlaceholder
              key={i}
              storageType="save"
              boxId={selectedBox.idInt}
              boxSlot={i}
              pkmId={pkm?.id}
            />
          );
        }

        return <StorageSaveItem key={pkm.id} saveId={saveId} pkmId={pkm.id} />;
      })}

      {moveContext.selected?.storageType === 'save' && !moveContext.selected.target && (
        <StorageSaveItem saveId={saveId} pkmId={moveContext.selected.id} />
      )}
    </StorageBox>
  );
};
