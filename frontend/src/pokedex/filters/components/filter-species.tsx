import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterInput } from "../../../ui/filter/filter-input/filter-input";

export const FilterSpecies: React.FC = () => {
  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filters.speciesName ?? "",
  });
  const timeoutRef = React.useRef<NodeJS.Timeout>(null);

  const [value, setValue] = React.useState(searchValue);

  return (
    <FilterInput
      value={value}
      onChange={(e) => {
        setValue(e.target.value);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          navigate({
            search: {
              filters: {
                speciesName: e.target.value,
              },
            },
          });
        }, 500);
      }}
      enabled={value.length > 0}
    >
      Name
    </FilterInput>
  );
};
