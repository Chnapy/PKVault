import React from "react";
import { useApiV2PokemonSpeciesRetrieve } from "../../data/sdk-pokeapi/pokemon/pokemon.gen";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useSaveInfosGetAll } from "../../data/sdk/save-infos/save-infos.gen";
import { DetailsCard } from "../../ui/details-card/details-card";
import { PokedexContext } from "../context/pokedex-context";
import { GameButton } from "./game-button";
import { getGameInfos } from "./util/get-game-infos";

export const PokedexDetails: React.FC = () => {
  const species = PokedexContext.useValue();
  const dexGetAllQuery = useDexGetAll();
  const saveInfosGetAllQuery = useSaveInfosGetAll();
  const pokemonQuery = useApiV2PokemonSpeciesRetrieve(species + "", {
    query: {
      enabled: !Number.isNaN(species),
    },
  });

  const [selectedSaveIndex, setSelectedSaveIndex] = React.useState(0);

  const savesRecord = saveInfosGetAllQuery.data?.data ?? {};
  const speciesRecord = dexGetAllQuery.data?.data ?? {};

  const speciesValues = Object.values(speciesRecord[species + ""] ?? {});

  const gameSaves = speciesValues
    .filter((spec) => spec.isAnySeen)
    .map((spec) => (savesRecord[spec.saveId] ?? [])[0])
    .filter(Boolean);

  React.useEffect(() => {
    if (selectedSaveIndex > 0 && !gameSaves[selectedSaveIndex]) {
      setSelectedSaveIndex(0);
    }
  }, [gameSaves, selectedSaveIndex]);

  if (!gameSaves.length || !pokemonQuery.data) {
    return null;
  }

  const selectedSave = gameSaves[selectedSaveIndex] ?? gameSaves[0];
  const selectedSpeciesValue = speciesValues.find(
    (value) => value.saveId === selectedSave.id
  )!;

  const caught = selectedSpeciesValue.isCaught;
  const speciesName = selectedSpeciesValue.speciesName;

  const gameInfos = getGameInfos(selectedSave.version);

  const speciesNameTranslated = pokemonQuery.data.data.names.find(
    (name) => name.language.name === "fr"
  )?.name;
  const description = pokemonQuery.data.data.flavor_text_entries.find(
    (entry) =>
      entry.language.name === "fr" &&
      entry.version.name === gameInfos.pokeapiName
  )?.flavor_text;

  return (
    <DetailsCard
      species={species}
      speciesName={speciesName}
      speciesNameTranslated={speciesNameTranslated}
      description={description}
      caught={caught}
      fromSaves={
        <>
          {gameSaves.map(({ version }, i) => (
            <GameButton
              key={version}
              version={version}
              onClick={() => setSelectedSaveIndex(i)}
              selected={i === selectedSaveIndex}
            />
          ))}
        </>
      }
      compatibleGames={null}
    />
  );
};
