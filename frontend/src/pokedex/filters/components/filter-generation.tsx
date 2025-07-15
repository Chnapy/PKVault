import React from "react";
import { useStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";

export const FilterGeneration: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filters.generations }) ?? [];

  const options = useStaticData().generation.map((generation) => ({
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
