import { useCurrentLanguageName } from '../../../data/hooks/use-current-language-name';
import type { DexItemDTO } from "../../../data/sdk/model";
import { useStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";

export const usePokedexFilters = () => {

  const getCurrentLanguageName = useCurrentLanguageName();

  const filterSpeciesName = Route.useSearch({ select: (search) => search.filterSpeciesName });
  const filterTypes = Route.useSearch({ select: (search) => search.filterTypes });
  const filterSeen = Route.useSearch({ select: (search) => search.filterSeen });
  const filterCaught = Route.useSearch({ select: (search) => search.filterCaught });
  const filterFromGames = Route.useSearch({ select: (search) => search.filterFromGames });
  const filterGenerations = Route.useSearch({ select: (search) => search.filterGenerations });

  const staticData = useStaticData();

  const isPkmFiltered = (
    species: number,
    speciesValues: DexItemDTO[]
  ): boolean => {
    const pkmSpeciesInfos = staticData.pokemonSpecies[ species ];
    const pkmInfos = staticData.pokemon[ species ];

    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);

    if (filterSpeciesName) {
      const name = getCurrentLanguageName(pkmSpeciesInfos.names);

      if (!name.toLowerCase().includes(filterSpeciesName.toLowerCase())) {
        return true;
      }
    }

    if (filterTypes?.length) {
      if (
        filterTypes.some((type) =>
          pkmInfos.types.every((t) => t.type.name !== type)
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
          (generation) => generation !== pkmSpeciesInfos.generation.name
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
