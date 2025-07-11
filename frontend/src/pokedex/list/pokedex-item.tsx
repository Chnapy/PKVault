import React from "react";
import { DexItem } from "../../ui/dex-item/dex-item";
import { PokedexContext } from "../context/pokedex-context";

export type PokedexItemProps = {
  species: number;
  speciesName: string;
  seen: boolean;
  caught: boolean;
  onClick: (species: number) => void;
};

export const PokedexItem: React.FC<PokedexItemProps> = ({
  species,
  speciesName,
  seen,
  caught,
  onClick: onClickFn,
}) => {
  const selectedPkm = PokedexContext.useValue();
  //   console.log(species);

  const selected = species === selectedPkm;
  const onClick = React.useMemo(
    () => (seen ? () => onClickFn(selected ? NaN : species) : undefined),
    [onClickFn, seen, selected, species]
  );

  return (
    <DexItem
      species={species}
      speciesName={speciesName}
      seen={seen}
      caught={caught}
      selected={selected}
      onClick={onClick}
    />
  );
};
