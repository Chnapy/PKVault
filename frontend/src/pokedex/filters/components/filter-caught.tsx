import React from "react";
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { ItemImg } from '../../../ui/details-card/item-img';
import { FilterCheckbox } from "../../../ui/filter/filter-checkbox/filter-checkbox";

export const FilterCaught: React.FC = () => {
  const { t } = useTranslate();

  const staticData = useStaticData();

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
      <ItemImg
        item={staticData.itemPokeball.id}
        size={'1lh'}
        style={{ margin: '0 -4px' }}
      />

      {searchValue === undefined
        ? t('dex.filters.caught.unselect')
        : searchValue
          ? t('dex.filters.caught.yes')
          : t('dex.filters.caught.no')}
    </FilterCheckbox>
  );
};
