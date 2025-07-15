import type { DexItemDTO } from "../../../data/sdk/model";
import { useStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";

export const usePokedexFilters = () => {
  const filters = Route.useSearch({ select: (search) => search.filters });

  const staticData = useStaticData();

  const isPkmFiltered = (
    species: number,
    speciesValues: DexItemDTO[]
  ): boolean => {
    const pkmSpeciesInfos = staticData.pokemonSpecies[species];
    const pkmInfos = staticData.pokemon[species];

    const seen = speciesValues.some((spec) => spec.isAnySeen);
    const caught = speciesValues.some((spec) => spec.isCaught);

    if (filters.speciesName) {
      const name = pkmSpeciesInfos.names.find(
        (n) => n.language.name === "fr"
      )!.name;

      if (!name.toLowerCase().includes(filters.speciesName.toLowerCase())) {
        return true;
      }
    }

    if (filters.types?.length) {
      if (
        filters.types.some((type) =>
          pkmInfos.types.every((t) => t.type.name !== type)
        )
      ) {
        return true;
      }
    }

    if (filters.seen !== undefined) {
      if ((filters.seen && !seen) || (!filters.seen && seen)) {
        return true;
      }
    }

    if (filters.caught !== undefined) {
      if ((filters.caught && !caught) || (!filters.caught && caught)) {
        return true;
      }
    }

    if (filters.fromGames?.length) {
      if (
        speciesValues.every((spec) => !filters.fromGames!.includes(spec.saveId))
      ) {
        return true;
      }
    }

    if (filters.generations?.length) {
      if (
        filters.generations.every(
          (generation) => generation !== pkmSpeciesInfos.generation.name
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const filterSpeciesValues = (value: DexItemDTO) => {
    if (!filters.fromGames?.length) {
      return true;
    }

    return filters.fromGames.includes(value.saveId);
  };

  return {
    isPkmFiltered,
    filterSpeciesValues,
  };
};
