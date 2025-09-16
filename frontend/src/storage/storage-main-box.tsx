import React from "react";
import type { PkmDTO } from "../data/sdk/model";
import {
  useStorageGetMainBoxes,
  useStorageGetMainPkms
} from "../data/sdk/storage/storage.gen";
import { Route } from "../routes/storage";
import { Button } from "../ui/button/button";
import { FilterSelect } from "../ui/filter/filter-select/filter-select";
import { Icon } from '../ui/icon/icon';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { StorageMainItem } from './storage-main-item';

export const StorageMainBox: React.FC = () => {
  const mainBoxId = Route.useSearch({ select: (search) => search.mainBoxId });
  const navigate = Route.useNavigate();

  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();
  console.log('LIST')
  const boxes = boxesQuery.data?.data ?? [];
  const pkms = pkmsQuery.data?.data ?? [];

  // const [boxId, setBoxId] = React.useState<number>();

  const selectedBoxIndex =
    typeof mainBoxId === "number"
      ? boxes.findIndex((box) => box.idInt === mainBoxId)
      : 0;
  const selectedBox = boxes[ selectedBoxIndex ];

  if (!selectedBox) {
    return null;
  }

  const previousBox = boxes[ selectedBoxIndex - 1 ];
  const nextBox = boxes[ selectedBoxIndex + 1 ];

  if (!selectedBox) {
    return null;
  }

  const boxPkms = Object.fromEntries(
    pkms
      .filter((pkm) => pkm.boxId === selectedBox.idInt)
      .map((pkm) => [ pkm.boxSlot, pkm ])
  );

  const allItems = new Array(6 * 5)
    .fill(null)
    .map((_, i): PkmDTO | null => boxPkms[ i ] ?? null);

  return (
    <StorageBox
      header={
        <>
          <Button
            onClick={() =>
              navigate({
                search: {
                  mainBoxId: previousBox.idInt,
                },
              })
            }
            disabled={!previousBox}
          >
            <Icon name='angle-left' forButton />
          </Button>

          <FilterSelect
            enabled={false}
            options={[
              ...boxes.map((box) => ({
                value: box.id + "",
                label: box.name,
              })),
              {
                value: "",
                label: "Create new box",
              },
            ]}
            value={[ selectedBox.id + "" ]}
            onChange={([ value ]) => {
              navigate({
                search: {
                  mainBoxId: Number(value),
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
                  mainBoxId: nextBox.idInt,
                },
              })
            }
            disabled={!nextBox}
          >
            <Icon name='angle-right' forButton />
          </Button>
        </>
      }
    >
      {allItems.map((pkm, i) => {
        if (!pkm) {
          return (
            <StorageItemPlaceholder
              key={i}
              storageType="main"
              boxId={selectedBox.idInt}
              boxSlot={i}
            />
          );
        }

        return <StorageMainItem key={pkm.id} pkmId={pkm.id} />;
      })}
    </StorageBox>
  );
};
