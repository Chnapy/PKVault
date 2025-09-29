import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";
import { useTranslate } from '../../../translate/i18n';

export const FilterCaught: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.filterCaught,
  });

  return (
    <FilterCheckbox
      enabled={searchValue !== undefined}
      checked={searchValue !== undefined}
      onClick={() =>
        navigate({
          search: {
            filterCaught: searchValue
              ? false
              : searchValue === false
                ? undefined
                : true,
          },
        })
      }
    >
      {searchValue === undefined
        ? t('dex.filters.caught.unselect')
        : searchValue
          ? t('dex.filters.caught.yes')
          : t('dex.filters.caught.no')}
    </FilterCheckbox>
  );
};
