import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { useStaticData } from "../../data/static-data/static-data";
import { usePokedexFilters } from "./hooks/use-pokedex-filters";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC = () => {
  console.time("pokedex-list");

  const staticData = useStaticData();

  const { data } = useDexGetAll();

  const { isPkmFiltered, filterSpeciesValues } = usePokedexFilters();

  if (!data) {
    return null;
  }

  const speciesRecord = data.data;

  const keys = Object.keys(speciesRecord)
    .map(Number)
    .sort((a, b) => a - b);

  const lastKey = keys[keys.length - 1];

  const speciesList = new Array(lastKey).fill(0).map((_, i) => i + 1);

  let currentGenerationName: string = "";

  const items: React.ReactNode[] = speciesList.map((species) => {
    const staticPkm = staticData.pokemonSpecies[species];
    const speciesValues = Object.values(
      speciesRecord[species + ""] ?? {}
    ).filter(filterSpeciesValues);

    if (speciesValues.length === 0) {
      return null;
    }

    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);
    const speciesName = speciesValues[0].speciesName;

    if (isPkmFiltered(species, speciesValues)) {
      return null;
    }

    let divider: React.ReactNode = null;

    if (staticPkm.generation.name !== currentGenerationName) {
      currentGenerationName = staticPkm.generation.name;
      divider = (
        <div
          key={currentGenerationName}
          style={{
            width: "100%",
            padding: "40px 40px 10px",
          }}
        >
          {
            staticData.generation
              .find((gen) => gen.name === currentGenerationName)
              ?.names.find((name) => name.language.name === "fr")?.name
          }
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
        />
      </React.Fragment>
    );
  });

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
      {items}
    </div>
  );
};
