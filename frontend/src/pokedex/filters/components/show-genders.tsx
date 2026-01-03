import React from "react";
import { Route } from "../../../routes/pokedex";
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";
import { useTranslate } from '../../../translate/i18n';
import { Gender as GenderEnum } from '../../../data/sdk/model';
import { Gender } from '../../../ui/gender/gender';

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
      <span>
        <Gender gender={GenderEnum.Male} />
        <Gender gender={GenderEnum.Female} />
      </span>
      {searchValue
        ? t('dex.filters.show-genders.yes')
        : t('dex.filters.show-genders.no')}
    </FilterCheckbox>
  );
};
