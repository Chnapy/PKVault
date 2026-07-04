import { Group } from '@mantine/core';
import { CheckIcon } from 'lucide-react';
import React from "react";
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { UIMultiSelect } from '../../../ui-new/form/select/ui-multi-select';
import { UIGameImg } from '../../../ui-new/sprite-img/ui-game-img';
import { filterIsDefined } from '../../../util/filter-is-defined';

export const FilterFromGames: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const currentValue = Route.useSearch({ select: (search) => search.filterFromGames })?.map(String) ?? [];

  const { versions } = useStaticData();

  const saveInfosQuery = useSaveInfosGetAll();

  const options = [
    '0',
    ...Object.values(saveInfosQuery.data?.data ?? {})
      .filter(filterIsDefined)
      .map((save) => save.id + '')
  ];

  return <UIMultiSelect
    name='filter-game'
    controlLabel='Filter by game'
    label='Storages'
    placeholder='Filter by game'
    value={currentValue}
    data={options}
    onChange={(storages) => navigate({
      search: {
        filterFromGames: storages.map(Number),
      },
    })}
    pillsNoWrap
    renderOption={({ option, checked }) => {
      if (!saveInfosQuery.data)
        return null;

      const saveId = +option.value;
      const save = saveInfosQuery.data.data[ saveId ];
      const name = save && versions[ save.version ]?.name;

      return <Group>
        {checked && <CheckIcon />}
        <UIGameImg
          version={save?.version ?? null}
          size='1lh'
        />
        {save
          ? <>{name} - {save.trainerName}</>
          : 'PKVault'}
      </Group>;
    }}
    renderPill={({ value }) => {
      if (!saveInfosQuery.data || !value)
        return null;

      const saveId = +value;
      const save = saveInfosQuery.data.data[ saveId ];

      return <UIGameImg
        version={save?.version ?? null}
        size='1lh'
      />;
    }}
  // size='xs'
  // w={140}
  />;
};
