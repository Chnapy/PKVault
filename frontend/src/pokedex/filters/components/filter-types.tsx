import React from "react";
import { useStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { useCurrentLanguageName } from '../../../data/hooks/use-current-language-name';

export const FilterTypes: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterTypes }) ?? [];

  const getCurrentLanguageName = useCurrentLanguageName();

  const allTypes = useStaticData().type;

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
        value: type.name,
        label: getCurrentLanguageName(type.names),
      }))}
    >
      Types
    </FilterSelect>
  );
};
