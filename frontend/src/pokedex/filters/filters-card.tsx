import { InputWrapper, Stack } from '@mantine/core';
import type React from "react";
import { withErrorCatcher } from '../../error/with-error-catcher';
import type { WithControlsIconsExtraProps } from '../../ui-new/interaction/controls/icons/with-controls-icons';
import { UIPokedexFilters } from '../../ui-new/pokedex/filters/ui-pokedex-filters';
import { FilterCaught } from "./components/filter-caught";
import { FilterFromGames } from "./components/filter-from-games";
import { FilterGeneration } from "./components/filter-generation";
import { FilterOwned } from './components/filter-owned';
import { FilterOwnedShiny } from './components/filter-owned-shiny';
import { FilterSeen } from "./components/filter-seen";
import { FilterSpecies } from "./components/filter-species";
import { FilterTypes } from "./components/filter-types";
import { FilterViews } from './components/filter-views';

export const FiltersCard: React.FC<WithControlsIconsExtraProps> = withErrorCatcher('default', (extraProps) => {

  return <UIPokedexFilters
    views={<FilterViews />}
    {...extraProps}
  >
    <FilterSpecies />

    <InputWrapper label='Status'>
      <Stack>
        <FilterSeen />
        <FilterCaught />
        <FilterOwned />
        <FilterOwnedShiny />
      </Stack>
    </InputWrapper>

    <Stack gap='sm'>
      <FilterTypes />
      <FilterFromGames />
      <FilterGeneration />
    </Stack>
  </UIPokedexFilters>;
});
