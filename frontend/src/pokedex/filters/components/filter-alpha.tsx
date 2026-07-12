import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui-new/form/select/ui-segmented-control';
import { UIAlphaIcon } from '../../../ui-new/icon/ui-alpha-icon';
import { switchUtil } from '../../../util/switch-util';

export const FilterAlpha: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: 'All' },
    { value: 'alpha', label: <UIAlphaIcon /> },
    { value: 'not-alpha', label: <UIAlphaIcon style={{ opacity: 0.5, filter: 'brightness(0)' }} /> },
  ] as const satisfies UISegmentedControlProps[ 'data' ];

  type Value = typeof data[ number ][ 'value' ];

  const currentValue = Route.useSearch({
    select: (search): Value => {
      if (search.filterAlpha === undefined)
        return 'all';

      if (search.filterAlpha)
        return 'alpha';

      return 'not-alpha';
    }
  });

  return <UISegmentedControl
    name='alpha'
    controlLabel='Filter by alpha'
    value={currentValue}
    data={data}
    onChange={(value) => startTransition(() => navigate({
      search: {
        filterAlpha: switchUtil(value, {
          'all': undefined,
          'alpha': true,
          'not-alpha': false,
        }),
      },
    }))}
    size='sm'
    style={{ flexGrow: 1 }}
  />;
};
