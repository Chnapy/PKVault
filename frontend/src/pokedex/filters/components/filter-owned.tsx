import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";
import { useTranslate } from '../../../translate/i18n';

export const FilterOwned: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filterOwned,
  });

  return (
    <FilterCheckbox
      enabled={searchValue !== undefined}
      checked={searchValue !== undefined}
      onClick={() =>
        navigate({
          search: {
            filterOwned: searchValue
              ? false
              : searchValue === false
                ? undefined
                : true,
          },
        })
      }
    >
      {searchValue === undefined
        ? t('dex.filters.owned.unselect')
        : searchValue
          ? t('dex.filters.owned.yes')
          : t('dex.filters.owned.no')}
    </FilterCheckbox>
  );
};
