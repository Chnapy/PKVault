import React from "react";
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { FilterSelect } from "../../../ui/filter/filter-select/filter-select";
import { filterIsDefined } from '../../../util/filter-is-defined';

export const FilterTypes: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterTypes }) ?? [];

  const staticData = useStaticData();

  const dexAll = useDexGetAll().data?.data ?? {};
  const allTypes = [ ...new Set(
    Object.values(dexAll).flatMap(value => Object.values(value)).flatMap(value => value.forms).flatMap(value => value.types)
  ) ].map(type => staticData.types[ type ]).filter(filterIsDefined);

  return (
    <FilterSelect
      enabled={searchValue.length > 0}
      multiple
      value={searchValue.map(String)}
      onChange={(types) => {
        navigate({
          search: {
            filterTypes: types.slice(types.length - 2).map(Number),
          },
        });
      }}
      options={allTypes.map((type) => ({
        value: type.id.toString(),
        label: type.name,
      }))}
    >
      {t('dex.filters.types')}
    </FilterSelect>
  );
};
