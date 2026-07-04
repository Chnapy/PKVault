import { EyeIcon, EyeOffIcon } from 'lucide-react';
import React from "react";
import { Route } from "../../../routes/pokedex";
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui-new/form/select/ui-segmented-control';
import { switchUtil } from '../../../util/switch-util';

export const FilterSeen: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: 'All' },
    { value: 'seen', label: <EyeIcon fontSize='1rem' /> },
    { value: 'not-seen', label: <EyeOffIcon fontSize='1rem' opacity={0.75} /> },
  ] as const satisfies UISegmentedControlProps[ 'data' ];

  type Value = typeof data[ number ][ 'value' ];

  const currentValue = Route.useSearch({
    select: (search): Value => {
      if (search.filterSeen === undefined)
        return 'all';

      if (search.filterSeen)
        return 'seen';

      return 'not-seen';
    }
  });

  return <UISegmentedControl
    name='seen'
    controlLabel='Filter by seen'
    value={currentValue}
    data={data}
    onChange={(value) => navigate({
      search: {
        filterSeen: switchUtil(value, {
          'all': undefined,
          'seen': true,
          'not-seen': false,
        }),
      },
    })}
    style={{ flexGrow: 1 }}
  />;
};
