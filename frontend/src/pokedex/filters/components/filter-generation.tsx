import React from "react";
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIMultiSelect } from '../../../ui-new/form/select/ui-multi-select';
import { filterIsDefined } from '../../../util/filter-is-defined';

export const FilterGeneration: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterGenerations }) ?? [];

  const staticData = useStaticData();

  const dexAll = useDexGetAll().data?.data ?? {};
  const allGenerations = [ ...new Set(
    Object.values(dexAll).flatMap(value => Object.values(value)).flatMap(value => staticData.species[ value.species ]?.generation)
  ) ].filter(filterIsDefined);

  const options = allGenerations.map((generation) => ({
    value: generation.toString(),
    label: t('dex.filters.generations.option', { generation, regions: staticData.generations[ generation ]?.regions.join(', ') }),
  }));

  return <UIMultiSelect
    name='filter-generation'
    controlLabel='Filter by generation'
    label={t('dex.filters.generations')}
    placeholder='Filter by generation'
    data={options}
    value={searchValue.map(String)}
    onChange={(values) => navigate({
      search: {
        filterGenerations: values.map(Number),
      },
    })}
    pillsNoWrap
    renderPill={({ value = '' }) => value[ 0 ]}
  // size='xs'
  // w={140}
  />;
};
