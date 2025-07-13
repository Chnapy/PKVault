import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useSaveInfosGetAll } from "../../data/sdk/save-infos/save-infos.gen";
import { arrayToRecord, db, pick } from "../../db/db";
import { getOrFetchPokemonSpeciesDataAll } from "../../pokeapi/modules/v2/pokemon-species";
import { prepareStaticData } from "../../pokeapi/pokeapi-data";
import { Route } from "../../routes/pokedex";
import { DetailsCard } from "../../ui/details-card/details-card";
import { GameButton } from "./game-button";
import { getGameInfos } from "./util/get-game-infos";

const getStaticData = prepareStaticData(async () => {
  const allSpecies = await getOrFetchPokemonSpeciesDataAll(db);

  return arrayToRecord(
    allSpecies.map((data) =>
      pick(data, ["id", "names", "flavor_text_entries"])
    ),
    "id"
  );
});

export const PokedexDetails: React.FC = () => {
  console.time("pokedex-details");
  const selectedSpecies = Route.useSearch({
    select: (search) => search.selected,
  });
  const dexGetAllQuery = useDexGetAll();
  const saveInfosGetAllQuery = useSaveInfosGetAll();
  const pokemonSpeciesInfos = selectedSpecies
    ? getStaticData()[selectedSpecies]
    : undefined;

  const [selectedSaveIndex, setSelectedSaveIndex] = React.useState(0);

  const savesRecord = saveInfosGetAllQuery.data?.data ?? {};
  const speciesRecord = dexGetAllQuery.data?.data ?? {};

  const speciesValues = Object.values(
    speciesRecord[selectedSpecies + ""] ?? {}
  );

  const gameSaves = speciesValues
    .filter((spec) => spec.isAnySeen)
    .map((spec) => (savesRecord[spec.saveId] ?? [])[0])
    .filter(Boolean);

  React.useEffect(() => {
    if (selectedSaveIndex > 0 && !gameSaves[selectedSaveIndex]) {
      setSelectedSaveIndex(0);
    }
  }, [gameSaves, selectedSaveIndex]);

  if (!selectedSpecies || !gameSaves.length || !pokemonSpeciesInfos) {
    console.timeEnd("pokedex-details");
    return null;
  }

  const selectedSave = gameSaves[selectedSaveIndex] ?? gameSaves[0];
  const selectedSpeciesValue = speciesValues.find(
    (value) => value.saveId === selectedSave.id
  )!;

  const caught = selectedSpeciesValue.isCaught;
  const speciesName = selectedSpeciesValue.speciesName;

  const gameInfos = getGameInfos(selectedSave.version);

  const speciesNameTranslated = pokemonSpeciesInfos.names.find(
    (name) => name.language.name === "fr"
  )?.name;
  const description = pokemonSpeciesInfos.flavor_text_entries.find(
    (entry) =>
      entry.language.name === "fr" &&
      entry.version.name === gameInfos.pokeapiName
  )?.flavor_text;

  console.timeEnd("pokedex-details");

  return (
    <DetailsCard
      species={selectedSpecies}
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
