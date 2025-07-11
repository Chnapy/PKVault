import type React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { PokedexItem } from "./pokedex-item";

export const PokedexList: React.FC<{
  setSelectedPkm: (species: number) => void;
}> = ({ setSelectedPkm }) => {
  const { data } = useDexGetAll();

  const speciesRecord = data?.data ?? {};

  const keys = Object.keys(speciesRecord)
    .map(Number)
    .sort(function (a, b) {
      return a - b;
    });

  const lastKey = keys[keys.length - 1];

  const items: React.ReactNode[] = [];
  for (let species = 1; species <= lastKey; species++) {
    const speciesValues = Object.values(speciesRecord[species + ""] ?? {});
    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);
    const speciesName = speciesValues[0].speciesName;

    if ([151, 251, 306, 494, 649, 721, 809].includes(species - 1)) {
      items.push(<hr key={species + "-hr"} style={{ width: "100%" }} />);
    }

    items.push(
      <PokedexItem
        key={species}
        species={species}
        speciesName={speciesName}
        seen={seen}
        caught={caught}
        onClick={setSelectedPkm}
      />
    );
  }

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
