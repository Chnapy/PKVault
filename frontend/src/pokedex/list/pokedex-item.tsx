import React from "react";
import { Route } from "../../routes/pokedex";
import { DexItem } from "../../ui/dex-item/dex-item";
import type { GameVersion } from '../../data/sdk/model';

export type PokedexItemProps = {
  species: number;
  speciesName: string;
  seen: boolean;
  caught: boolean;
  caughtVersions: GameVersion[];
  seenOnlyVersions: GameVersion[];
};

export const PokedexItem: React.FC<PokedexItemProps> = ({
  species,
  speciesName,
  seen,
  caught,
  caughtVersions,
  seenOnlyVersions,
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
      speciesName={speciesName}
      seen={seen}
      caught={caught}
      caughtVersions={caughtVersions}
      seenOnlyVersions={seenOnlyVersions}
      selected={selected}
      onClick={onClick}
    />
  );
};
