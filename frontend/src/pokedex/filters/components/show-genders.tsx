import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";
import { useTranslate } from '../../../translate/i18n';

export const ShowGenders: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.showGenders ?? false,
  });

  return (
    <FilterCheckbox
      enabled={searchValue}
      checked={searchValue}
      onClick={() =>
        navigate({
          search: {
            showGenders: !searchValue || undefined,
          },
        })
      }
    >
      {searchValue
        ? t('dex.filters.show-genders.yes')
        : t('dex.filters.show-genders.no')}
    </FilterCheckbox>
  );
};
