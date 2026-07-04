import { Group } from '@mantine/core';
import React from "react";
import { withErrorCatcher } from '../error/with-error-catcher';
import { PokedexMainWrapperDetails } from '../pokedex/details/pokedex-main-wrapper-details';
import { FiltersCard } from "../pokedex/filters/filters-card";
import { PokedexList } from "../pokedex/list/pokedex-list";
import { UIPokedexContent } from '../ui-new/pokedex/ui-pokedex-content';

export const PokedexPage: React.FC = withErrorCatcher('default', () => {
  return <UIPokedexContent>
    <Group mah='100%' align='flex-start' wrap='nowrap'>
      <FiltersCard mah='100%' miw={300} />

      <PokedexMainWrapperDetails>
        <PokedexList />
      </PokedexMainWrapperDetails>
    </Group>
  </UIPokedexContent>;
});
