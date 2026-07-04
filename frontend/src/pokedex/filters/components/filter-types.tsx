import { CheckIcon, Group } from '@mantine/core';
import React from "react";
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIMultiSelect } from '../../../ui-new/form/select/ui-multi-select';
import { getTypeImg } from '../../../ui-new/type-item/util/get-type-img';
import { filterIsDefined } from '../../../util/filter-is-defined';

export const FilterTypes: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({ select: (search) => search.filterTypes }) ?? [];

  const staticData = useStaticData();

  const dexAll = useDexGetAll().data?.data ?? {};
  const allTypes = [ ...new Set(
    Object.values(dexAll).flatMap(value => Object.values(value)).flatMap(value => value.forms).flatMap(value => value.types)
  ) ].map(type => staticData.types[ type ]).filter(filterIsDefined);

  return <UIMultiSelect
    name='filter-type'
    controlLabel='Filter by type'
    label={t('dex.filters.types')}
    placeholder='Filter by type'
    data={allTypes.map((type) => ({
      value: type.id.toString(),
      label: type.name,
    }))}
    value={searchValue.map(String)}
    onChange={(types) => navigate({
      search: {
        filterTypes: types.slice(types.length - 2).map(Number),
      },
    })}
    pillsNoWrap
    renderOption={({ option, checked }) => {
      const type = +option.value;

      return <Group>
        {checked && <CheckIcon />}
        <img src={getTypeImg(type).img} />
        {option.label}
      </Group>;
    }}
    renderPill={({ value }) => {
      const type = +(value ?? '0');

      return <img src={getTypeImg(type).img} />;
    }}
    style={{ flexGrow: 1 }}
  />;
};
