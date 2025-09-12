import React from "react";
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";

export const FilterGeneration: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterGenerations }) ?? [];

  const staticData = useStaticData();

  const dexAll = useDexGetAll().data?.data ?? {};
  const allGenerations = [ ...new Set(
    Object.values(dexAll).flatMap(value => Object.values(value)).flatMap(value => staticData.species[ value.species ].generation)
  ) ];

  const options = allGenerations.map((generation) => ({
    value: generation.toString(),
    label: `Generation ${generation}`,
  }));

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue.map(String)}
      onChange={(values) => {
        navigate({
          search: {
            filterGenerations: values.map(Number),
          },
        });
      }}
      options={options}
    >
      Generations
    </FilterSelect>
  );
};
