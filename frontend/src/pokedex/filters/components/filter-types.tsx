import { Group, Image } from '@mantine/core';
import { CheckIcon } from 'lucide-react';
import React, { startTransition } from "react";
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIMultiSelect } from '../../../ui-new/form/select/ui-multi-select';
import { getTypeImg } from '../../../ui-new/type-item/util/get-type-img';

export const FilterTypes: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue = Route.useSearch({ select: (search) => search.filterTypes }) ?? [];

  const staticData = useStaticData();

  const allTypes = Object.values(staticData.types);

  return <UIMultiSelect
    name='filter-type'
    controlLabel='Filter by type'
    label={t('dex.filters.types')}
    data={allTypes.map((type) => ({
      value: type.id.toString(),
      label: type.name,
    }))}
    value={searchValue.map(String)}
    onChange={(types) => startTransition(() => navigate({
      search: {
        filterTypes: types.slice(types.length - 2).map(Number),
      },
    }))}
    pillsNoWrap
    renderOption={({ option, checked }) => {
      const type = +option.value;

      return <Group>
        {checked && <CheckIcon height='1lh' />}
        <Image src={getTypeImg(type).img} h='1lh' w='auto' bdrs='md' />
        {option.label}
      </Group>;
    }}
    renderPill={({ value }) => {
      const type = +(value ?? '0');

      return <Image src={getTypeImg(type).img} h='1lh' w='auto' bdrs='md' />;
    }}
    style={{ flexGrow: 1 }}
  />;
};
