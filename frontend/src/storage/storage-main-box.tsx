import React from "react";
import type { PkmDTO } from "../data/sdk/model";
import {
  useStorageGetMainBoxes,
  useStorageGetMainPkms
} from "../data/sdk/storage/storage.gen";
import { Route } from "../routes/storage";
import { Button } from "../ui/button/button";
import { FilterSelect, type FilterSelectProps } from "../ui/filter/filter-select/filter-select";
import { Icon } from '../ui/icon/icon';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { theme } from '../ui/theme';
import { StorageMoveContext } from './actions/storage-move-context';
import { StorageMainItem } from './storage-main-item';

export const StorageMainBox: React.FC = () => {
  const mainBoxId = Route.useSearch({ select: (search) => search.mainBoxId });
  const navigate = Route.useNavigate();

  const moveContext = StorageMoveContext.useValue();
  const isMoveDragging = !!moveContext.selected && !moveContext.selected.target;

  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();

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

  const previousBox = boxes[ selectedBoxIndex - 1 ] ?? boxes[ boxes.length - 1 ];
  const nextBox = boxes[ selectedBoxIndex + 1 ] ?? boxes[ 0 ];

  const boxesOptions = [
    ...boxes.map((box): FilterSelectProps[ 'options' ][ number ] => ({
      value: box.id + "",
      label: box.name,
    })),
    !isMoveDragging && {
      value: "",
      label: "Create new box",
    },
  ].filter((opt): opt is FilterSelectProps[ 'options' ][ number ] => !!opt);

  const boxPkmsList = pkms.filter((pkm) => pkm.boxId === selectedBox.idInt);

  const boxPkms = Object.fromEntries(
    boxPkmsList.map((pkm) => [ pkm.boxSlot, pkm ])
  );

  const boxMaxItems = 6 * 5;

  const allItems = new Array(boxMaxItems)
    .fill(null)
    .map((_, i): PkmDTO | null => boxPkms[ i ] ?? null);

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
                    mainBoxId: previousBox.idInt,
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
              options={boxesOptions}
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
              triggerOnHover={isMoveDragging}
              onClick={() =>
                navigate({
                  search: {
                    mainBoxId: nextBox.idInt,
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
            /{boxMaxItems} - Total.<span style={{ color: theme.text.primary }}>{pkms.length}</span>
          </div>
        </>
      }
    >
      {allItems.map((pkm, i) => {
        if (!pkm
          || (moveContext.selected?.storageType === 'main'
            && !moveContext.selected.target
            && moveContext.selected.id === pkm.id
          )
        ) {
          return (
            <StorageItemPlaceholder
              key={i}
              storageType="main"
              boxId={selectedBox.idInt}
              boxSlot={i}
              pkmId={pkm?.id}
            />
          );
        }

        return <StorageMainItem key={i} pkmId={pkm.id} />;
      })}

      {moveContext.selected?.storageType === 'main' && !moveContext.selected.target && (
        <StorageMainItem pkmId={moveContext.selected.id} />
      )}
    </StorageBox>
  );
};
