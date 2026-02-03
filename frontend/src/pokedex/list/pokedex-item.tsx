import { css } from "@emotion/css";
import React from "react";
import { withErrorCatcher } from "../../error/with-error-catcher";
import { Route } from "../../routes/pokedex";
import { ButtonLike } from "../../ui/button/button-like";
import { getSpeciesNO } from "../../ui/dex-item/util/get-species-no";
import { theme } from "../../ui/theme";

export type PokedexItemProps = {
  species: number;
  isSeen: boolean;
  children: React.ReactNode[];
};

export const PokedexItem: React.FC<PokedexItemProps> = withErrorCatcher(
  "item",
  React.memo(({ species, isSeen, children }) => {
    const selectedPkm = Route.useSearch({
      select: (search) => search.selected,
    });
    const navigate = Route.useNavigate();

    const selected = species === selectedPkm;
    const onClick = React.useMemo(
      () =>
        isSeen
          ? () =>
              navigate({
                search: {
                  selected: selected ? undefined : species,
                },
              })
          : undefined,
      [navigate, isSeen, selected, species],
    );

    return (
      <ButtonLike
        onClick={onClick}
        selected={selected}
        noDropshadow={!onClick}
        disabled={!onClick}
        className={css({
          position: "relative",
          alignSelf: "flex-start",
          padding: 0,
          borderColor: isSeen ? theme.text.default : undefined,
        })}
      >
        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
          })}
        >
          {children}
        </div>

        <div
          className={css({
            position: "absolute",
            left: 0,
            top: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px",
            backgroundColor: theme.bg.darker,
            color: theme.text.light,
            borderBottomRightRadius: 4,
          })}
        >
          <span>{getSpeciesNO(species)}</span>
        </div>
      </ButtonLike>
    );
  }),
);
