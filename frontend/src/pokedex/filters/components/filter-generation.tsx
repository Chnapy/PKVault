import React from "react";
import { db } from "../../../data/db/db";
import { getOrFetchGenerationDataAll } from "../../../data/static-data/pokeapi/generation";
import { prepareStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { pick } from "../../../util/pick";

const useStaticGenerations = prepareStaticData(
  "filter-generation",
  async () => {
    const allData = await getOrFetchGenerationDataAll(db);

    return allData.map((generation) =>
      pick(generation, ["id", "name", "names"])
    );
  }
);

export const FilterGeneration: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filters.generations }) ?? [];

  const options = useStaticGenerations().map((generation) => ({
    value: generation.name,
    label: generation.names.find((name) => name.language.name === "fr")!.name,
  }));

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue}
      onChange={(values) => {
        navigate({
          search: {
            filters: {
              generations: values,
            },
          },
        });
      }}
      options={options}
    >
      Generations
    </FilterSelect>
  );
};
