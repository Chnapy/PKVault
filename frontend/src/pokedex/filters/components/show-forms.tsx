import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";
import { useTranslate } from '../../../translate/i18n';

export const ShowForms: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({
    select: (search) => search.showForms ?? false,
  });

  return (
    <FilterCheckbox
      enabled={searchValue}
      checked={searchValue}
      onClick={() =>
        navigate({
          search: {
            showForms: !searchValue || undefined,
          },
        })
      }
    >
      {searchValue
        ? t('dex.filters.show-forms.yes')
        : t('dex.filters.show-forms.no')}
    </FilterCheckbox>
  );
};
