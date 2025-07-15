import React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { usePokedexFilters } from "./hooks/use-pokedex-filters";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC = () => {
  console.time("pokedex-list");

  const { data } = useDexGetAll();

  const { isPkmFiltered, filterSpeciesValues } = usePokedexFilters();

  if (!data) {
    return null;
  }

  const speciesRecord = data.data;

  const keys = Object.keys(speciesRecord)
    .map(Number)
    .sort(function (a, b) {
      return a - b;
    });

  const lastKey = keys[keys.length - 1];

  const speciesList = new Array(lastKey).fill(0).map((_, i) => i + 1);

  const items: React.ReactNode[] = speciesList.map((species) => {
    const speciesValues = Object.values(
      speciesRecord[species + ""] ?? {}
    ).filter(filterSpeciesValues);

    if (speciesValues.length === 0) {
      return null;
    }

    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);
    const speciesName = speciesValues[0].speciesName;

    let divider: React.ReactNode = null;

    if ([151, 251, 386, 494, 649, 721, 809].includes(species - 1)) {
      divider = <hr key={species + "-hr"} style={{ width: "100%" }} />;
    }

    if (isPkmFiltered(species, speciesValues)) {
      return divider;
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
