import React from "react";
import { Route } from "../../routes/pokedex";
import { DexItem } from "../../ui/dex-item/dex-item";

export type PokedexItemProps = {
  species: number;
  speciesName: string;
  seen: boolean;
  caught: boolean;
};

export const PokedexItem: React.FC<PokedexItemProps> = ({
  species,
  speciesName,
  seen,
  caught,
}) => {
  const selectedPkm = Route.useSearch({ select: (search) => search.selected });
  const navigate = Route.useNavigate();

  const selected = species === selectedPkm;
  const onClick = React.useMemo(
    () =>
      seen
        ? () =>
            navigate({
              search: {
                selected: selected ? undefined : species,
              },
            })
        : undefined,
    [navigate, seen, selected, species]
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
