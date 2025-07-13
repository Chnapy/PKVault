import React from "react";
import { db, pick } from "../../../db/db";
import { getOrFetchTypeDataAll } from "../../../pokeapi/modules/v2/type";
import { prepareStaticData } from "../../../pokeapi/pokeapi-data";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";

const getStaticData = prepareStaticData(async () => {
  const allTypes = await getOrFetchTypeDataAll(db);

  return allTypes.map((data) => pick(data, ["id", "name", "names"]));
});

export const FilterTypes: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filters.types }) ?? [];

  const allTypes = getStaticData();

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue}
      onChange={(types) => {
        navigate({
          search: {
            filters: {
              types: types.slice(types.length - 2),
            },
          },
        });
      }}
      options={allTypes.map((type) => ({
        value: type.name,
        label: type.names.find((name) => name.language.name === "fr")!.name,
      }))}
    >
      Types
    </FilterSelect>
  );
};
