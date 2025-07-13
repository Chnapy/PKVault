import { pick } from "@tanstack/react-router";
import React from "react";
import { db } from "../../../data/db/db";
import { getOrFetchTypeDataAll } from "../../../data/static-data/pokeapi/type";
import { prepareStaticData } from "../../../data/static-data/static-data";
import { Route } from "../../../routes/pokedex";
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";

const useStaticTypes = prepareStaticData("filter-types", async () => {
  const allTypes = await getOrFetchTypeDataAll(db);

  return allTypes.map((data) => pick(data, ["id", "name", "names"]));
});

export const FilterTypes: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filters.types }) ?? [];

  const allTypes = useStaticTypes();

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
