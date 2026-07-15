import { Group } from '@mantine/core';
import React from "react";
import { withErrorCatcher } from '../error/with-error-catcher';
import { PokedexMainWrapperDetails } from '../pokedex/details/pokedex-main-wrapper-details';
import { FiltersCard } from "../pokedex/filters/filters-card";
import { PokedexList } from "../pokedex/list/pokedex-list";
import { useSpriteSizeLocalStorage } from '../ui-new/local-storage/use-storage-size-local-storage';
import { UIPokedexContent } from '../ui-new/pokedex/ui-pokedex-content';
import { UISpriteSizeWrapper } from '../ui-new/sprite-img/ui-sprite-size-wrapper';

export const PokedexPage: React.FC = withErrorCatcher('default', () => {
  const [ speciesSize ] = useSpriteSizeLocalStorage('pokedex-sprite-size');

  return <UIPokedexContent>
    <UISpriteSizeWrapper
      speciesSize={speciesSize}
      component={Group}
      mah='100%' align='flex-start' wrap='nowrap'
    >
      <FiltersCard mah='100%' w={300} style={{ flexShrink: 0 }} />

      <PokedexMainWrapperDetails>
        <PokedexList />
      </PokedexMainWrapperDetails>
    </UISpriteSizeWrapper>
  </UIPokedexContent>;
});
