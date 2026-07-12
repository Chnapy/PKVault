import { CircleOff } from 'lucide-react';
import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui-new/form/select/ui-segmented-control';
import { UIBallIcon } from '../../../ui-new/icon/ui-ball-icon';
import { UIPokedexIcons } from '../../../ui-new/pokedex/icons/ui-pokedex-icons';
import { switchUtil } from '../../../util/switch-util';

export const FilterCaught: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: 'All' },
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
    controlLabel='Filter by caught'
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
