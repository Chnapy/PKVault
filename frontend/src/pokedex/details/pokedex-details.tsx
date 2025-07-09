import type React from "react";
import { PokedexContext } from "../context/pokedex-context";
import { DetailsCard } from "../../ui/details-card/details-card";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useSaveInfosGetAll } from "../../data/sdk/save-infos/save-infos.gen";
import { GameButton } from "./game-button";

export const PokedexDetails: React.FC = () => {
  const species = PokedexContext.useValue();
  const dexGetAllQuery = useDexGetAll();
  const saveInfosGetAllQuery = useSaveInfosGetAll();

  if (
    Number.isNaN(species) ||
    !dexGetAllQuery.data ||
    !saveInfosGetAllQuery.data
  ) {
    return null;
  }

  const savesRecord = saveInfosGetAllQuery.data.data;
  const speciesRecord = dexGetAllQuery.data.data;

  const speciesValues = Object.values(speciesRecord[species + ""] ?? {});
  const seen = speciesValues.some((spec) => spec.isAnySeen);
  const caught = speciesValues.some((spec) => spec.isCaught);
  const speciesName = speciesValues[0].speciesName;

  if (!seen) {
    return null;
  }

  const gameVersions = speciesValues
    .filter((spec) => spec.isAnySeen)
    .map((spec) => savesRecord[spec.saveId][0].version);

  console.log(speciesValues, gameVersions);

  return (
    <DetailsCard
      species={species}
      speciesName={speciesName}
      caught={caught}
      fromGames={
        <>
          {gameVersions.map((version) => (
            <GameButton key={version} version={version} onClick={console.log} />
          ))}
        </>
      }
      compatibleGames={null}
    />
  );
};
