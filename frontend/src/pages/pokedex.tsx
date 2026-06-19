import { css } from '@emotion/css';
import React from "react";
import { withErrorCatcher } from '../error/with-error-catcher';
import { PokedexDetails } from "../pokedex/details/pokedex-details";
import { FiltersCard } from "../pokedex/filters/filters-card";
import { PokedexList } from "../pokedex/list/pokedex-list";
import { Route } from '../routes/pokedex';
import { DetailsCardWrapper } from '../ui/details-card/details-card-wrapper';

export const PokedexPage: React.FC = withErrorCatcher('default', () => {
  const navigate = Route.useNavigate();

  return (
    <div>
      <div>
        <div
          className={css({
            display: "flex",
            justifyContent: "center",
            paddingBottom: 8,
          })}
        >
          <FiltersCard />
        </div>

        <PokedexList />
      </div>

      <DetailsCardWrapper
        onClose={() => navigate({
          search: {
            selected: undefined,
          }
        })}
      >
        <PokedexDetails />
      </DetailsCardWrapper>
    </div>
  );
});
