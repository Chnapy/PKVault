import { Group, Splitter, useMatches } from '@mantine/core';
import React from "react";
import { withErrorCatcher } from '../error/with-error-catcher';
import { PokedexMainWrapperDetails } from '../pokedex/details/pokedex-main-wrapper-details';
import { FiltersCard } from "../pokedex/filters/filters-card";
import { PokedexList } from "../pokedex/list/pokedex-list";
import { useSpriteSizeLocalStorage } from '../ui/local-storage/use-storage-size-local-storage';
import { UIPokedexContent } from '../ui/pokedex/ui-pokedex-content';
import { UISpriteSizeWrapper } from '../ui/sprite-img/ui-sprite-size-wrapper';

export const PokedexPage: React.FC = withErrorCatcher('default', () => {
  const [ speciesSizeRaw ] = useSpriteSizeLocalStorage('pokedex-sprite-size');

  const speciesSize = useMatches({
    base: 0.5,
    xs: 0.75,
    // sm: 0.75,
    md: 1,
    lg: speciesSizeRaw,
  });

  const getResponsiveContent = useMatches({
    base: () => <Splitter w='100%' h='100%'>
      <Splitter.Pane defaultSize='300px' max='300px' min='10px'>
        <FiltersCard mah='100%' w={300} style={{ flexShrink: 0 }} />
      </Splitter.Pane>

      <Splitter.Pane defaultSize={100}>
        <PokedexMainWrapperDetails>
          <PokedexList />
        </PokedexMainWrapperDetails>
      </Splitter.Pane>
    </Splitter>,
    sm: () => <>
      <FiltersCard mah='100%' w={300} style={{ flexShrink: 0 }} />

      <PokedexMainWrapperDetails>
        <PokedexList />
      </PokedexMainWrapperDetails>
    </>,
  });

  return <UIPokedexContent>
    <UISpriteSizeWrapper
      speciesSize={speciesSize}
      component={Group}
      mah='100%' align='flex-start' wrap='nowrap'
    >
      {getResponsiveContent()}
    </UISpriteSizeWrapper>
  </UIPokedexContent>;
});
