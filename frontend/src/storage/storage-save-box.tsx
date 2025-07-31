import React from "react";
import type { PkmSaveDTO, SaveInfosDTO } from "../data/sdk/model";
import { useSaveInfosGetAll } from "../data/sdk/save-infos/save-infos.gen";
import {
  useStorageGetSaveBoxes,
  useStorageGetSavePkms,
} from "../data/sdk/storage/storage.gen";
import { Route } from "../routes/storage";
import { SaveItem } from "../saves/save-item/save-item";
import { Button } from "../ui/button/button";
import { FilterSelect } from "../ui/filter/filter-select/filter-select";
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageItem } from "../ui/storage-item/storage-item";
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const saveBoxId = Route.useSearch({ select: (search) => search.saveBoxId });
  const selected = Route.useSearch({ select: (search) => search.selected });
  const navigate = Route.useNavigate();

  const saveInfosRecord = useSaveInfosGetAll().data?.data ?? {};
  const saveInfos = saveInfosRecord[saveId]?.[0] as SaveInfosDTO | undefined;

  const saveBoxesQuery = useStorageGetSaveBoxes(saveId);
  const savePkmsQuery = useStorageGetSavePkms(saveId);

  const saveBoxes = saveBoxesQuery.data?.data ?? [];
  const savePkms = savePkmsQuery.data?.data ?? [];

  const selectedBoxIndex =
    typeof saveBoxId === "number"
      ? saveBoxes.findIndex((box) => box.idInt === saveBoxId)
      : 0;
  const selectedBox = saveBoxes[selectedBoxIndex];

  if (!selectedBox || !saveInfos) {
    return null;
  }

  const previousBox = saveBoxes[selectedBoxIndex - 1];
  const nextBox = saveBoxes[selectedBoxIndex + 1];

  const boxPkms = Object.fromEntries(
    savePkms
      .filter((pkm) => pkm.box === selectedBox.idInt)
      .map((pkm) => [pkm.boxSlot, pkm])
  );

  const allItems = new Array(saveInfos.boxSlotCount)
    .fill(null)
    .map((_, i): PkmSaveDTO | null => boxPkms[i] ?? null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
      }}
    >
      <SaveItem saveId={saveId} />

      <StorageBox
        header={
          <>
            <Button
              onClick={() =>
                navigate({
                  search: {
                    saveBoxId: previousBox.idInt,
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
                ...saveBoxes.map((box) => ({
                  value: box.id,
                  label: box.name,
                })),
                {
                  value: "",
                  label: "Create new box",
                },
              ]}
              value={[selectedBox.id]}
              onChange={([value]) => {
                navigate({
                  search: {
                    saveBoxId: Number(value),
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
                    saveBoxId: nextBox.idInt,
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
                storageType="save"
                boxId={selectedBox.idInt}
                boxSlot={i}
              />
            );
          }
          // const versions = pkmSaves.filter((value) => value.pkmId === pkm.id);

          // if (versions.length === 0) {
          //   return <div>Error versions are empty for Pkm.Id={pkm.id}</div>;
          // }

          return (
            <StorageItem
              key={"pkm-" + pkm.id}
              storageType="save"
              pkmId={pkm.id}
              species={pkm.species}
              warning={pkm.isValid}
              // disabled={Boolean(pkm.saveId)}
              boxSlot={i}
              selected={selected?.type === "save" && selected.id === pkm.id}
              onClick={() =>
                navigate({
                  search: {
                    selected: {
                      type: "save",
                      id: pkm.id,
                    },
                  },
                })
              }
            />
          );
        })}
      </StorageBox>
    </div>
  );
};
