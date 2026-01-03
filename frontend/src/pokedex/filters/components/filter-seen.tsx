import React from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";
import { Icon } from '../../../ui/icon/icon';

export const FilterSeen: React.FC = () => {
  const { t } = useTranslate();

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
      <Icon name='eye' forButton />
      {searchValue === undefined
        ? t('dex.filters.seen.unselect')
        : searchValue
          ? t('dex.filters.seen.yes')
          : t('dex.filters.seen.no')}
    </FilterCheckbox>
  );
};
