import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";

export const FilterSeen: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filterSeen,
  });

  return (
    <FilterCheckbox
      enabled={searchValue !== undefined}
      checked={searchValue !== undefined}
      onClick={() =>
        navigate({
          search: {
            filterSeen: searchValue
              ? false
              : searchValue === false
                ? undefined
                : true,
          },
        })
      }
    >
      {searchValue === undefined
        ? "Seen ?"
        : searchValue
          ? "Seen only"
          : "Not seen only"}
    </FilterCheckbox>
  );
};
