import React from "react";
import type { PkmDTO } from "../data/sdk/model";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import {
  useStorageGetMainBoxes,
  useStorageGetMainPkms,
  useStorageGetMainPkmVersions,
} from "../data/sdk/storage/storage.gen";
import { useStaticData } from '../hooks/use-static-data';
import { Route } from "../routes/storage";
import { Button } from "../ui/button/button";
import { FilterSelect } from "../ui/filter/filter-select/filter-select";
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageItem } from "../ui/storage-item/storage-item";
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";

export const StorageMainBox: React.FC = () => {
  const mainBoxId = Route.useSearch({ select: (search) => search.mainBoxId });
  const saveId = Route.useSearch({ select: (search) => search.save });
  const selected = Route.useSearch({ select: (search) => search.selected });
  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const saveInfosQuery = useSaveInfosGetAll();
  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();
  const pkmVersionsQuery = useStorageGetMainPkmVersions();

  const save = saveId ? saveInfosQuery.data?.data?.[ saveId ] : undefined;

  const boxes = boxesQuery.data?.data ?? [];
  const pkms = pkmsQuery.data?.data ?? [];
  const pkmVersions = pkmVersionsQuery.data?.data ?? [];

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
              boxId={selectedBox.idInt}
              boxSlot={i}
            />
          );
        }
        const versions = pkmVersions.filter((value) => value.pkmId === pkm.id);

        if (versions.length === 0) {
          return (
            <div key={i}>Error versions are empty for Pkm.Id={pkm.id}</div>
          );
        }

        const species = versions[ 0 ].species;
        const isShiny = versions[ 0 ].isShiny;

        const saveHeldItem = save && versions.find((version) => version.generation === save.generation)?.heldItem;
        const heldItem = saveHeldItem ?? versions.find((version) => version.id === pkm.id)?.heldItem;

        const sprite = versions[ 0 ].isShiny
          ? staticData.species[ versions[ 0 ].species ].spriteShiny
          : (versions[ 0 ].isEgg
            ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png'
            : staticData.species[ versions[ 0 ].species ].spriteDefault);

        return (
          <StorageItem
            key={"pkm-" + pkm.id}
            storageType="main"
            pkmId={pkm.id}
            species={species}
            isEgg={false}
            isShiny={isShiny}
            isShadow={false}
            sprite={sprite}
            heldItemSprite={heldItem ? staticData.items[ heldItem ].sprite : undefined}
            warning={versions.some((value) => !value.isValid)}
            disabled={
              Boolean(pkm.saveId)
              || (!!save && species > save.maxSpeciesId)
              // || !versions.some(
              //   (version) =>
              //     !saveInfos || version.generation === saveInfos?.generation
              // )
            }
            shouldCreateVersion={
              !!save && !versions.some(version => version.generation === save.generation)
            }
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
