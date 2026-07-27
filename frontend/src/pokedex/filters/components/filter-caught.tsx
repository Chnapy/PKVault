import { CircleOff } from 'lucide-react';
import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui/form/select/ui-segmented-control';
import { UIBallIcon } from '../../../ui/icon/ui-ball-icon';
import { UIPokedexIcons } from '../../../ui/pokedex/icons/ui-pokedex-icons';
import { switchUtil } from '../../../util/switch-util';

export const FilterCaught: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: t('all') },
    { value: 'caught', label: <UIPokedexIcons.Caught size='xs' fz='1rem' /> },
    { value: 'not-caught', label: <CircleOff fontSize='1rem' opacity={0.75}><UIBallIcon /></CircleOff> },
  ] as const satisfies UISegmentedControlProps[ 'data' ];

  type Value = typeof data[ number ][ 'value' ];

  const currentValue = Route.useSearch({
    select: (search): Value => {
      if (search.filterCaught === undefined)
        return 'all';

      if (search.filterCaught)
        return 'caught';

      return 'not-caught';
    }
  });

  return <UISegmentedControl
    name='caught'
    controlLabel={t('dex.filters.caught')}
    value={currentValue}
    data={data}
    onChange={(value) => startTransition(() => navigate({
      search: {
        filterCaught: switchUtil(value, {
          'all': undefined,
          'caught': true,
          'not-caught': false,
        }),
      },
    }))}
    size='sm'
    style={{ flexGrow: 1 }}
  />;
};
