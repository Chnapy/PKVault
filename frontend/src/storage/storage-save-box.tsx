import React from "react";
import { BoxType, type PkmSaveDTO, type SaveInfosDTO } from "../data/sdk/model";
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
import { switchUtil } from '../util/switch-util';
import { StorageSaveItem } from './storage-save-item';

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const saveBoxId = Route.useSearch({ select: (search) => search.saveBoxId });
  const navigate = Route.useNavigate();

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

  const previousBox = saveBoxes[ selectedBoxIndex - 1 ];
  const nextBox = saveBoxes[ selectedBoxIndex + 1 ];

  const boxPkms = Object.fromEntries(
    savePkms
      .filter((pkm) => pkm.box === selectedBox.idInt)
      .map((pkm) => [ pkm.boxSlot, pkm ])
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
          {/* {partyBox && <Button
              onClick={() =>
                navigate({
                  search: {
                    saveBoxId: partyBox.id,
                  },
                })
              }
            >
              {partyBox.name ?? 'Party'}
            </Button>} */}

          <Button
            onClick={() =>
              navigate({
                search: {
                  saveBoxId: previousBox.id,
                },
              })
            }
            disabled={!previousBox || previousBox.type !== BoxType.Default}
          >
            <Icon name='angle-left' forButton />
          </Button>

          <FilterSelect
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
            onClick={() =>
              navigate({
                search: {
                  saveBoxId: nextBox.id,
                },
              })
            }
            disabled={!nextBox || nextBox.type !== BoxType.Default}
          >
            <Icon name='angle-right' forButton />
          </Button>

          {/* {daycareBox && <Button
              onClick={() =>
                navigate({
                  search: {
                    saveBoxId: daycareBox.id,
                  },
                })
              }
            >
              {daycareBox.name ?? 'Daycare'}
            </Button>} */}
        </>
      }
    >
      {allItems.map((pkm, i) => {
        if (!pkm) {
          return (
            <StorageItemPlaceholder
              key={i}
              storageType="save"
              boxId={selectedBox.idInt}
              boxSlot={i}
            />
          );
        }

        return <StorageSaveItem key={pkm.id} saveId={saveId} pkmId={pkm.id} />;
      })}
    </StorageBox>
  );
};
