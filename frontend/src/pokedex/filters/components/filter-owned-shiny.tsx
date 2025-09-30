import React from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";

export const FilterOwnedShiny: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filterOwnedShiny,
  });

  return (
    <FilterCheckbox
      enabled={searchValue !== undefined}
      checked={searchValue !== undefined}
      onClick={() =>
        navigate({
          search: {
            filterOwnedShiny: searchValue
              ? false
              : searchValue === false
                ? undefined
                : true,
          },
        })
      }
    >
      {searchValue === undefined
        ? t('dex.filters.owned-shiny.unselect')
        : searchValue
          ? t('dex.filters.owned-shiny.yes')
          : t('dex.filters.owned-shiny.no')}
    </FilterCheckbox>
  );
};
