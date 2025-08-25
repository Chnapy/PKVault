import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';

export const FilterTypes: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterTypes }) ?? [];

  const dexAll = useDexGetAll().data?.data ?? {};
  const allTypes = [ ...new Set(
    Object.values(dexAll).flatMap(value => Object.values(value)).flatMap(value => value.types)
  ) ];

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue}
      onChange={(types) => {
        navigate({
          search: {
            filterTypes: types.slice(types.length - 2),
          },
        });
      }}
      options={allTypes.map((type) => ({
        value: type,
        label: type,
      }))}
    >
      Types
    </FilterSelect>
  );
};
