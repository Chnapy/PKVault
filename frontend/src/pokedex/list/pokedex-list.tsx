import React from "react";
import { useCurrentLanguageName } from '../../data/hooks/use-current-language-name';
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useStaticData } from "../../data/static-data/static-data";
import { useSaveInfosMain } from '../../saves/hooks/use-save-infos-main';
import { theme } from '../../ui/theme';
import { usePokedexFilters } from "./hooks/use-pokedex-filters";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC = () => {
  console.time("pokedex-list");

  const getCurrentLanguageName = useCurrentLanguageName();

  const staticData = useStaticData();

  const saveInfosData = useSaveInfosMain().data?.data;

  const { data } = useDexGetAll();

  const { isPkmFiltered, filterSpeciesValues } = usePokedexFilters();

  if (!data || !saveInfosData) {
    return null;
  }

  const speciesRecord = data.data;

  const keys = Object.keys(speciesRecord)
    .map(Number)
    .sort((a, b) => a - b);

  const lastKey = keys[ keys.length - 1 ];

  const speciesList = new Array(lastKey).fill(0).map((_, i) => i + 1);

  let currentGenerationName: string = "";

  const filteredSpeciesList = speciesList.filter(species => {
    const speciesValues = Object.values(
      speciesRecord[ species + "" ] ?? {}
    ).filter(filterSpeciesValues);

    return speciesValues.length > 0
      && !isPkmFiltered(species, speciesValues);
  });

  const items: React.ReactNode[] = filteredSpeciesList.map((species) => {
    const staticPkm = staticData.pokemonSpecies[ species ];
    const speciesValues = Object.values(
      speciesRecord[ species + "" ] ?? {}
    ).filter(filterSpeciesValues);

    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);
    const speciesName = speciesValues[ 0 ].speciesName;

    let divider: React.ReactNode = null;

    if (staticPkm.generation.name !== currentGenerationName) {
      currentGenerationName = staticPkm.generation.name;

      const allGenSpecies = filteredSpeciesList.filter(species => {
        const staticPkm = staticData.pokemonSpecies[ species ];
        return staticPkm.generation.name === currentGenerationName;
      });

      const seenGenCount = allGenSpecies.filter(species => {
        const speciesValues = Object.values(
          speciesRecord[ species + "" ] ?? {}
        ).filter(filterSpeciesValues);

        return speciesValues.some((spec) => spec.isAnySeen);
      }).length;

      const caughtGenCount = allGenSpecies.filter(species => {
        const speciesValues = Object.values(
          speciesRecord[ species + "" ] ?? {}
        ).filter(filterSpeciesValues);

        return speciesValues.some((spec) => spec.isCaught);
      }).length;

      divider = (
        <div
          key={currentGenerationName}
          style={{
            width: "100%",
            padding: "40px 40px 10px",
          }}
        >
          {getCurrentLanguageName(
            staticData.generation
              .find((gen) => gen.name === currentGenerationName)!.names)}

          <div
            style={{
              float: 'right'
            }}
          >
            seen.<span style={{ color: theme.text.primary }}>{seenGenCount}</span> caught.
            <span style={{ color: theme.text.primary }}>{caughtGenCount}</span> total.
            <span style={{ color: theme.text.primary }}>{allGenSpecies.length}</span>
          </div>

          <hr />
        </div>
      );
    }

    return (
      <React.Fragment key={species}>
        {divider}

        <PokedexItem
          species={species}
          speciesName={speciesName}
          seen={seen}
          caught={caught}
          caughtVersions={
            speciesValues
              .filter((spec) => spec.isCaught)
              .map(val => saveInfosData[ val.saveId ].version)
          }
          seenOnlyVersions={
            speciesValues
              .filter((spec) => spec.isAnySeen && !spec.isCaught)
              .map(val => saveInfosData[ val.saveId ].version)
          }
        />
      </React.Fragment>
    );
  });

  const seenGenCount = filteredSpeciesList.filter(species => {
    const speciesValues = Object.values(
      speciesRecord[ species + "" ] ?? {}
    ).filter(filterSpeciesValues);

    return speciesValues.some((spec) => spec.isAnySeen);
  }).length;

  const caughtGenCount = filteredSpeciesList.filter(species => {
    const speciesValues = Object.values(
      speciesRecord[ species + "" ] ?? {}
    ).filter(filterSpeciesValues);

    return speciesValues.some((spec) => spec.isCaught);
  }).length;


  console.timeEnd("pokedex-list");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        overflow: "auto",
        //   maxHeight: "100%",
        flexWrap: "wrap",
        padding: 4,
      }}
    >
      <div>
        seen.<span style={{ color: theme.text.primary }}>{seenGenCount}</span> caught.
        <span style={{ color: theme.text.primary }}>{caughtGenCount}</span> total.
        <span style={{ color: theme.text.primary }}>{filteredSpeciesList.length}</span>
      </div>
      {items}
    </div>
  );
};
