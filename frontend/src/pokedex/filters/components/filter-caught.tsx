import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";

export const FilterCaught: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filters.caught,
  });

  return (
    <FilterCheckbox
      enabled={searchValue !== undefined}
      checked={searchValue !== undefined}
      onClick={() =>
        navigate({
          search: {
            filters: {
              caught: searchValue
                ? false
                : searchValue === false
                  ? undefined
                  : true,
            },
          },
        })
      }
    >
      {searchValue === undefined
        ? "Caught ?"
        : searchValue
          ? "Caught only"
          : "Not caught only"}
    </FilterCheckbox>
  );
};
