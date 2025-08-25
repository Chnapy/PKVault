import type { DexItemDTO } from "../../../data/sdk/model";
import { Route } from "../../../routes/pokedex";

export const usePokedexFilters = () => {
  const filterSpeciesName = Route.useSearch({ select: (search) => search.filterSpeciesName });
  const filterTypes = Route.useSearch({ select: (search) => search.filterTypes });
  const filterSeen = Route.useSearch({ select: (search) => search.filterSeen });
  const filterCaught = Route.useSearch({ select: (search) => search.filterCaught });
  const filterFromGames = Route.useSearch({ select: (search) => search.filterFromGames });
  const filterGenerations = Route.useSearch({ select: (search) => search.filterGenerations });

  const isPkmFiltered = (
    speciesValues: DexItemDTO[]
  ): boolean => {
    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);

    if (filterSpeciesName) {
      const name = speciesValues[ 0 ].speciesName;

      if (!name.toLowerCase().includes(filterSpeciesName.toLowerCase())) {
        return true;
      }
    }

    if (filterTypes?.length) {
      if (
        filterTypes.some((type) =>
          speciesValues[ 0 ].types.every((t) => t !== type)
        )
      ) {
        return true;
      }
    }

    if (filterSeen !== undefined) {
      if ((filterSeen && !seen) || (!filterSeen && seen)) {
        return true;
      }
    }

    if (filterCaught !== undefined) {
      if ((filterCaught && !caught) || (!filterCaught && caught)) {
        return true;
      }
    }

    if (filterFromGames?.length) {
      if (
        speciesValues.every((spec) => !filterFromGames!.includes(spec.saveId))
      ) {
        return true;
      }
    }

    if (filterGenerations?.length) {
      if (
        filterGenerations.every(
          (generation) => generation !== speciesValues[ 0 ].generation
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const filterSpeciesValues = (value: DexItemDTO) => {
    if (!filterFromGames?.length) {
      return true;
    }

    return filterFromGames.includes(value.saveId);
  };

  return {
    isPkmFiltered,
    filterSpeciesValues,
  };
};
