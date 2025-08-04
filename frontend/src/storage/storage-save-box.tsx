import React from "react";
import { BoxType, type PkmSaveDTO, type SaveInfosDTO } from "../data/sdk/model";
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
import { switchUtil } from '../util/switch-util';

export type StorageSaveBoxProps = {
  saveId: number;
};

export const StorageSaveBox: React.FC<StorageSaveBoxProps> = ({ saveId }) => {
  const saveBoxId = Route.useSearch({ select: (search) => search.saveBoxId });
  const selected = Route.useSearch({ select: (search) => search.selected });
  const navigate = Route.useNavigate();

  const saveInfosRecord = useSaveInfosGetAll().data?.data ?? {};
  const saveInfos = saveInfosRecord[ saveId ]?.[ 0 ] as SaveInfosDTO | undefined;

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
    [ -1 ]: saveInfos.partyCount,
    [ -2 ]: saveInfos.daycareCount,
  }) as number | undefined ?? saveInfos.boxSlotCount;

  const allItems = new Array(itemsCount)
    .fill(null)
    .map((_, i): PkmSaveDTO | null => boxPkms[ i ] ?? null);

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
      <div style={{
        display: 'flex',
        gap: 8,
      }}>
        <SaveItem saveId={saveId} />

        <Button as={Route.Link} to={Route.to} search={{
          save: undefined,
          saveBoxId: undefined,
          selected: undefined,
        }}>Back</Button>
      </div>

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
              {"<"}
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
              {">"}
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
