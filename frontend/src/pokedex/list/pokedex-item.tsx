import React from "react";
import { Route } from "../../routes/pokedex";
import { DexItem, type DexItemProps } from "../../ui/dex-item/dex-item";

export type PokedexItemProps = Pick<DexItemProps, 'species' | 'seen' | 'caught' | 'owned' | 'ownedShiny'>;

export const PokedexItem: React.FC<PokedexItemProps> = React.memo(({
  species,
  seen,
  caught,
  owned,
  ownedShiny,
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
    [ navigate, seen, selected, species ]
  );

  return (
    <DexItem
      species={species}
      seen={seen}
      caught={caught}
      owned={owned}
      ownedShiny={ownedShiny}
      selected={selected}
      onClick={onClick}
    />
  );
});
