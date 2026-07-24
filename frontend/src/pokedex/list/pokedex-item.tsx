import React from "react";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { Route } from "../../routes/pokedex";
import { UIPokedexItem } from '../../ui/pokedex/pokedex-item/ui-pokedex-item';

export type PokedexItemProps = {
  species: number;
  speciesName: string;
  isSeen: boolean;
  children: React.ReactNode[];
};

export const PokedexItem: React.FC<PokedexItemProps> = withErrorCatcher("item", React.memo(({ species, speciesName, isSeen, children }) => {
  const navigate = Route.useNavigate();

  const selected = Route.useSearch({ select: (search) => search.selected === species });

  const onClick = React.useMemo(() => isSeen
    ? () =>
      navigate({
        search: {
          selected: selected ? undefined : species,
        },
      })
    : undefined,
    [ navigate, isSeen, selected, species ],
  );

  return <UIPokedexItem
    id={`species-${species}`}
    species={species}
    // form={}
    label={speciesName}
    selected={selected}
    onClick={onClick}
  >
    {children}
  </UIPokedexItem>;
}));
