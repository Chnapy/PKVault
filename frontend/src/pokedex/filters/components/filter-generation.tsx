import React from "react";
import { useStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { useCurrentLanguageName } from '../../../data/hooks/use-current-language-name';

export const FilterGeneration: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterGenerations }) ?? [];

  const getCurrentLanguageName = useCurrentLanguageName();

  const options = useStaticData().generation.map((generation) => ({
    value: generation.name,
    label: getCurrentLanguageName(generation.names),
  }));

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue}
      onChange={(values) => {
        navigate({
          search: {
            filterGenerations: values,
          },
        });
      }}
      options={options}
    >
      Generations
    </FilterSelect>
  );
};
