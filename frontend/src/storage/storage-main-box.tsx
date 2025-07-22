import React from "react";
import type { PkmDTO } from "../data/sdk/model";
import {
  useStorageGetMainBoxes,
  useStorageGetMainPkms,
  useStorageGetMainPkmVersions,
} from "../data/sdk/storage/storage.gen";
import { Button } from "../ui/button/button";
import { FilterSelect } from "../ui/filter/filter-select/filter-select";
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageItem } from "../ui/storage-item/storage-item";
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { Route } from "../routes/storage";

export const StorageMainBox: React.FC = () => {
  const mainBoxId = Route.useSearch({ select: (search) => search.mainBoxId });
  const selected = Route.useSearch({ select: (search) => search.selected });
  const navigate = Route.useNavigate();

  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();
  const pkmVersionsQuery = useStorageGetMainPkmVersions();

  const boxes = boxesQuery.data?.data ?? [];
  const pkms = pkmsQuery.data?.data ?? [];
  const pkmVersions = pkmVersionsQuery.data?.data ?? [];

  // const [boxId, setBoxId] = React.useState<number>();

  const selectedBoxIndex =
    typeof mainBoxId === "number"
      ? boxes.findIndex((box) => box.id === mainBoxId)
      : 0;
  const selectedBox = boxes[selectedBoxIndex];

  if (!selectedBox) {
    return null;
  }

  const previousBox = boxes[selectedBoxIndex - 1];
  const nextBox = boxes[selectedBoxIndex + 1];

  if (!selectedBox) {
    return null;
  }

  const boxPkms = Object.fromEntries(
    pkms
      .filter((pkm) => pkm.boxId === selectedBox.id)
      .map((pkm) => [pkm.boxSlot, pkm])
  );

  const allItems = new Array(6 * 5)
    .fill(null)
    .map((_, i): PkmDTO | null => boxPkms[i] ?? null);

  return (
    <StorageBox
      header={
        <>
          <Button
            onClick={() =>
              navigate({
                search: {
                  mainBoxId: previousBox.id,
                },
              })
            }
            disabled={!previousBox}
          >
            {"<"}
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
            value={[selectedBox.id + ""]}
            onChange={([value]) => {
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
                  mainBoxId: nextBox.id,
                },
              })
            }
            disabled={!nextBox}
          >
            {">"}
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
              boxId={selectedBox.id}
              boxSlot={i}
            />
          );
        }
        const versions = pkmVersions.filter((value) => value.pkmId === pkm.id);

        if (versions.length === 0) {
          return <div>Error versions are empty for Pkm.Id={pkm.id}</div>;
        }

        return (
          <StorageItem
            key={"pkm-" + pkm.id}
            storageType="main"
            pkmId={pkm.id}
            species={pkm.species}
            warning={versions.some((value) => !value.isValid)}
            disabled={Boolean(pkm.saveId)}
            boxSlot={i}
            selected={selected?.type === "main" && selected.id === pkm.id}
            onClick={() =>
              navigate({
                search: {
                  selected: {
                    type: "main",
                    id: pkm.id,
                  },
                },
              })
            }
          />
        );
      })}
    </StorageBox>
  );
};
