import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useSaveInfosGetAll } from "../../data/sdk/save-infos/save-infos.gen";
import { useStaticData } from "../../data/static-data/static-data";
import { Route } from "../../routes/pokedex";
import { DetailsCard, type DetailsCardProps } from "../../ui/details-card/details-card";
import { GameButton } from "./game-button";
import { getGameInfos } from "./util/get-game-infos";
import { switchUtil } from '../../util/switch-util';

export const PokedexDetails: React.FC = () => {
  console.time("pokedex-details");
  const selectedSpecies = Route.useSearch({
    select: (search) => search.selected,
  });

  const generationList = useStaticData().generation;
  const typeList = useStaticData().type;
  const pkmSpeciesRecord = useStaticData().pokemonSpecies;
  const pkmRecord = useStaticData().pokemon;
  const abilityList = useStaticData().ability;

  const dexGetAllQuery = useDexGetAll();
  const saveInfosGetAllQuery = useSaveInfosGetAll();
  const pokemonSpeciesInfos = selectedSpecies
    ? pkmSpeciesRecord[ selectedSpecies ]
    : undefined;
  const pokemonInfos = selectedSpecies
    ? pkmRecord[ selectedSpecies ]
    : undefined;

  const [ selectedSaveIndex, setSelectedSaveIndex ] = React.useState(0);

  const savesRecord = saveInfosGetAllQuery.data?.data ?? {};
  const speciesRecord = dexGetAllQuery.data?.data ?? {};

  const speciesValues = Object.values(
    speciesRecord[ selectedSpecies + "" ] ?? {}
  );

  const gameSaves = speciesValues
    .filter((spec) => spec.isAnySeen)
    .map((spec) => (savesRecord[ spec.saveId ] ?? [])[ 0 ])
    .filter(Boolean);

  React.useEffect(() => {
    if (selectedSaveIndex > 0 && !gameSaves[ selectedSaveIndex ]) {
      setSelectedSaveIndex(0);
    }
  }, [ gameSaves, selectedSaveIndex ]);

  if (!selectedSpecies || !gameSaves.length || !pokemonSpeciesInfos || !pokemonInfos) {
    console.timeEnd("pokedex-details");
    return null;
  }

  const generation = generationList.find(gen => gen.name === pokemonSpeciesInfos.generation.name)!;

  const localSpecies = pokemonSpeciesInfos.pokedex_numbers.find(dex => dex.pokedex.name
    === generation.main_region.name
  )?.entry_number ?? -1;  // TODO needs "pokedex" endpoint

  const selectedSave = gameSaves[ selectedSaveIndex ] ?? gameSaves[ 0 ];
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

  const types = pokemonInfos.types.map(type =>
    typeList.find(t => t.name === type.type.name)!.names.find(name => name.language.name === 'fr')!.name
  );

  const genders = switchUtil<number, Record<number, DetailsCardProps[ 'genders' ]>>(pokemonSpeciesInfos.gender_rate, {
    [ -1 ]: [],
    0: [ 'male' ],
    8: [ 'female' ],
  }) ?? [ 'male', 'female' ];

  const abilities = pokemonInfos.abilities
    .filter(ab => !ab.is_hidden)
    .map(ab => abilityList.find(ability => ability.name === ab.ability.name)!.names
      .find(name => name.language.name === 'fr')!.name
    );
  const abilitiesHidden = pokemonInfos.abilities
    .filter(ab => ab.is_hidden)
    .map(ab => abilityList.find(ability => ability.name === ab.ability.name)!.names
      .find(name => name.language.name === 'fr')!.name
    );

  const stats = pokemonInfos.stats.map(stat => stat.base_stat);

  console.timeEnd("pokedex-details");

  return (
    <DetailsCard
      species={selectedSpecies}
      speciesName={speciesNameTranslated ?? speciesName}
      // hasShiny={false} // TODO
      localSpecies={localSpecies}
      genders={genders}
      types={types}
      description={description}
      abilities={abilities}
      abilitiesHidden={abilitiesHidden}
      stats={stats}
      caught={caught}
      fromSaves={
        <>
          {gameSaves.map(({ id, version, trainerName }, i) => (
            <GameButton
              key={id}
              version={version}
              trainerName={
                gameSaves.filter((save) => save.version === version).length > 1
                  ? trainerName
                  : undefined
              }
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
