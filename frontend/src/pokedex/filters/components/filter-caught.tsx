import { CircleOff } from 'lucide-react';
import React from "react";
import { Route } from "../../../routes/pokedex";
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui-new/form/select/ui-segmented-control';
import { UIBallIcon } from '../../../ui-new/icon/ui-ball-icon';
import { switchUtil } from '../../../util/switch-util';

export const FilterCaught: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: 'All' },
    { value: 'caught', label: <UIBallIcon fontSize='1rem' /> },
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
    onChange={(value) => navigate({
      search: {
        filterCaught: switchUtil(value, {
          'all': undefined,
          'caught': true,
          'not-caught': false,
        }),
      },
    })}
    style={{ flexGrow: 1 }}
  />;
};
