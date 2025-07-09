import type React from "react";
import { useDexGetAll } from "../../data/sdk/dex/dex.gen";
import { DexItem } from "../../ui/dex-item/dex-item";
import { PokedexContext } from "../context/pokedex-context";

export const PokedexList: React.FC<{
  setSelectedPkm: (species: number) => void;
}> = ({ setSelectedPkm }) => {
  const selectedPkm = PokedexContext.useValue();
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

    const onClick = seen
      ? () => setSelectedPkm(selectedPkm === species ? NaN : species)
      : undefined;

    items.push(
      <DexItem
        key={species}
        species={species}
        speciesName={speciesName}
        seen={seen}
        caught={caught}
        selected={species === selectedPkm}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
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
