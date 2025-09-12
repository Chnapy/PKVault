import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from "../../routes/pokedex";
import { DetailsCard } from "../../ui/details-card/details-card";
import { GameButton } from "./game-button";

export const PokedexDetails: React.FC = () => {
  // console.time("pokedex-details");
  const selectedSpecies = Route.useSearch({
    select: (search) => search.selected,
  });
  const navigate = Route.useNavigate();

  const staticData = useStaticData();

  const dexGetAllQuery = useDexGetAll();
  const saveInfosMainQuery = useSaveInfosGetAll();

  const [ selectedSaveIndex, setSelectedSaveIndex ] = React.useState(0);

  const savesRecord = saveInfosMainQuery.data?.data ?? {};
  const speciesRecord = dexGetAllQuery.data?.data ?? {};

  const speciesValues = Object.values(
    speciesRecord[ selectedSpecies + "" ] ?? {}
  );

  const gameSaves = speciesValues
    .filter((spec) => spec.isAnySeen)
    .map((spec) => savesRecord[ spec.saveId ])
    .filter(Boolean);

  React.useEffect(() => {
    if (selectedSaveIndex > 0 && !gameSaves[ selectedSaveIndex ]) {
      setSelectedSaveIndex(0);
    }
  }, [ gameSaves, selectedSaveIndex ]);

  if (!selectedSpecies || !gameSaves.length) {
    // console.timeEnd("pokedex-details");
    return null;
  }

  const localSpecies = -1;  // TODO needs "pokedex" endpoint

  const selectedSave = gameSaves[ selectedSaveIndex ] ?? gameSaves[ 0 ];
  const selectedSpeciesValue = speciesValues.find(
    (value) => value.saveId === selectedSave.id
  )!;

  const caught = selectedSpeciesValue.isCaught;

  const { name: speciesName, genders, spriteDefault, spriteShiny } = staticData.species[ selectedSpecies ];
  const typeNames = selectedSpeciesValue.types.map(type => staticData.types[ type ].name);
  const abilityNames = selectedSpeciesValue.abilities.map(ability => staticData.abilities[ ability ].name);

  const stats = selectedSpeciesValue.baseStats;

  // console.timeEnd("pokedex-details");

  return (
    <DetailsCard
      species={selectedSpecies}
      speciesName={speciesName}
      // hasShiny={false} // TODO
      localSpecies={localSpecies}
      genders={genders}
      types={typeNames}
      // description={selectedSpeciesValue.description}
      abilities={abilityNames}
      abilitiesHidden={[]}
      stats={stats}
      caught={caught}
      defaultSprite={spriteDefault}
      shinySprite={spriteShiny}
      ballSprite={staticData.itemPokeball.sprite}
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
      onClose={() => navigate({
        search: {
          selected: undefined,
        }
      })}
    />
  );
};
