import React, { startTransition } from "react";
import { useStaticData } from '../../../hooks/use-static-data';
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIMultiSelect } from '../../../ui-new/form/select/ui-multi-select';

export const FilterGeneration: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();
  const searchValue =
    Route.useSearch({ select: (search) => search.filterGenerations }) ?? [];

  const staticData = useStaticData();

  const allGenerations = Object.values(staticData.generations).map(g => g.id);

  const options = allGenerations.map((generation) => ({
    value: generation.toString(),
    label: t('dex.filters.generations.option', { generation, regions: staticData.generations[ generation ]?.regions.join(', ') }),
  }));

  return <UIMultiSelect
    name='filter-generation'
    controlLabel='Filter by generation'
    label={t('dex.filters.generations')}
    data={options}
    value={searchValue.map(String)}
    onChange={(values) => startTransition(() => navigate({
      search: {
        filterGenerations: values.map(Number),
      },
    }))}
    pillsNoWrap
    renderPill={({ value = '' }) => <span>G{value}</span>}
  // size='xs'
  // w={140}
  />;
};
