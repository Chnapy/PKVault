import React from "react";
import type { SaveInfosDTO } from "../data/sdk/model";
import { useSaveInfosGetAll } from "../data/sdk/save-infos/save-infos.gen";
import {
  getStorageGetMainPkmsQueryKey,
  getStorageGetMainPkmVersionsQueryKey,
  getStorageGetSavePkmsQueryKey,
  useStorageGetMainPkms,
  useStorageGetMainPkmVersions,
  useStorageGetSavePkms,
  useStorageMainCreatePkmVersion,
} from "../data/sdk/storage/storage.gen";
import { Button } from "../ui/button/button";
import { StorageItemDetails } from "../ui/storage-item-details/storage-item-details";
import { useStaticData } from "../data/static-data/static-data";
import { useQueryClient } from "@tanstack/react-query";

export type StorageDetailsProps = {
  type: "main" | "save";
  id: number;
  saveId?: number;
};

export const StorageDetails: React.FC<StorageDetailsProps> = ({
  type,
  id,
  saveId,
}) => {
  const staticData = useStaticData();

  const queryClient = useQueryClient();

  const saveInfosRecord = useSaveInfosGetAll().data?.data ?? {};
  const saveInfos = saveInfosRecord[saveId ?? -1]?.[0] as
    | SaveInfosDTO
    | undefined;

  const mainCreatePkmVersionMutation = useStorageMainCreatePkmVersion({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmsQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: getStorageGetMainPkmVersionsQueryKey(),
        });

        if (saveId)
          await queryClient.invalidateQueries({
            queryKey: getStorageGetSavePkmsQueryKey(saveId),
          });
      },
    },
  });

  const savePkmQuery = useStorageGetSavePkms(saveId!, {
    query: {
      enabled: !!saveId && type === "save",
    },
  });
  let savePkm = savePkmQuery.data?.data.find((pkm) => pkm.id === id);

  const mainPkmQuery = useStorageGetMainPkms({
    query: {
      // enabled: type === "main",
    },
  });
  const mainPkmVersionsQuery = useStorageGetMainPkmVersions({
    query: {
      // enabled: type === "main",
    },
  });
  let mainPkm = mainPkmQuery.data?.data.find((pkm) => pkm.id === id);
  let mainPkmVersions =
    mainPkmVersionsQuery.data?.data.filter(
      (pkm) => pkm.id === id || pkm.pkmId === id
    ) ?? [];

  if (mainPkmVersions.length && !mainPkm) {
    mainPkm = mainPkmQuery.data?.data.find(
      (pkm) => pkm.id === mainPkmVersions[0].pkmId
    );
    mainPkmVersions =
      mainPkmVersionsQuery.data?.data.filter(
        (pkm) => pkm.id === id || pkm.pkmId === mainPkm!.id
      ) ?? [];
    savePkm = undefined;
  }

  const pkmList = [savePkm!, ...mainPkmVersions].filter(Boolean);

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const selectedPkm = pkmList[selectedIndex] ?? pkmList[0];
  if (!selectedPkm) {
    return null;
  }

  const species =
    "species" in selectedPkm ? selectedPkm.species : mainPkm!.species;

  const speciesName =
    staticData.pokemonSpecies[species].names.find(
      (name) => name.language.name === "fr"
    )?.name ?? staticData.pokemonSpecies[species].name;

  return (
    <StorageItemDetails
      header={
        <>
          <div>id={id}</div>
          {!!mainPkm &&
            pkmList.map((pkm, i) => (
              <Button
                key={pkm.id}
                onClick={() => setSelectedIndex(i)}
                disabled={selectedIndex === i}
              >
                G{pkm.generation}
                {pkm.id === mainPkm?.id && " (original)"}
                {/* {pkm.id} */}
              </Button>
            ))}
          {saveInfos &&
            !pkmList.some((pkm) => pkm.generation === saveInfos.generation) && (
              <Button
                onClick={() =>
                  mainCreatePkmVersionMutation.mutateAsync({
                    params: {
                      generation: saveInfos.generation,
                      pkmId: mainPkm!.id,
                    },
                  })
                }
              >
                Create for G{saveInfos.generation}
              </Button>
            )}
        </>
      }
      saveId={type === "save" ? saveId : undefined}
      species={species}
      speciesName={speciesName}
      version={type === "save" ? saveInfos?.version : undefined}
      generation={selectedPkm.generation}
      isEgg={selectedPkm.isEgg}
      originStr={`${selectedPkm.originMetDate} ${selectedPkm.originMetLocation} ${selectedPkm.originTrainerName}`}
      nickname={selectedPkm.nickname}
      stats={selectedPkm.stats}
      ivs={selectedPkm.iVs}
      evs={selectedPkm.eVs}
      nature={selectedPkm.nature}
      ability={selectedPkm.ability}
      level={selectedPkm.level}
      exp={selectedPkm.exp}
      moves={selectedPkm.moves}
      isValid={selectedPkm.isValid}
      validityReport={selectedPkm.validityReport}
    />
  );
};
