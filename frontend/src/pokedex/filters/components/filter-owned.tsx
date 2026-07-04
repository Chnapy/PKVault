import { FolderIcon, FolderXIcon } from 'lucide-react';
import React from "react";
import { Route } from "../../../routes/pokedex";
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui-new/form/select/ui-segmented-control';
import { switchUtil } from '../../../util/switch-util';

export const FilterOwned: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: 'All' },
    { value: 'owned', label: <FolderIcon fontSize='1rem' /> },
    { value: 'not-owned', label: <FolderXIcon fontSize='1rem' opacity={0.75} /> },
  ] as const satisfies UISegmentedControlProps[ 'data' ];

  type Value = typeof data[ number ][ 'value' ];

  const currentValue = Route.useSearch({
    select: (search): Value => {
      if (search.filterOwned === undefined)
        return 'all';

      if (search.filterOwned)
        return 'owned';

      return 'not-owned';
    }
  });

  return <UISegmentedControl
    name='owned'
    controlLabel='Filter by owned'
    value={currentValue}
    data={data}
    onChange={(value) => navigate({
      search: {
        filterOwned: switchUtil(value, {
          'all': undefined,
          'owned': true,
          'not-owned': false,
        }),
      },
    })}
    style={{ flexGrow: 1 }}
  />;
};
