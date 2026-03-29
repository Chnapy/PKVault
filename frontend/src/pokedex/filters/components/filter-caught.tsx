import React from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { BallImg } from '../../../ui/img/ball-img';
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";

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
      <BallImg size={14} />

      {searchValue === undefined
        ? t('dex.filters.caught.unselect')
        : searchValue
          ? t('dex.filters.caught.yes')
          : t('dex.filters.caught.no')}
    </FilterCheckbox>
  );
};
