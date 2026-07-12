import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui-new/form/select/ui-segmented-control';
import { UIShinyIcon } from '../../../ui-new/icon/ui-shiny-icon';
import { switchUtil } from '../../../util/switch-util';

export const FilterOwnedShiny: React.FC = () => {
  // const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: 'All' },
    { value: 'shiny', label: <UIShinyIcon /> },
    { value: 'not-shiny', label: <UIShinyIcon style={{ opacity: 0.5, filter: 'brightness(0)' }} /> },
  ] as const satisfies UISegmentedControlProps[ 'data' ];

  type Value = typeof data[ number ][ 'value' ];

  const currentValue = Route.useSearch({
    select: (search): Value => {
      if (search.filterOwnedShiny === undefined)
        return 'all';

      if (search.filterOwnedShiny)
        return 'shiny';

      return 'not-shiny';
    }
  });

  return <UISegmentedControl
    name='shiny'
    controlLabel='Filter by shiny'
    value={currentValue}
    data={data}
    onChange={(value) => startTransition(() => navigate({
      search: {
        filterOwnedShiny: switchUtil(value, {
          'all': undefined,
          'shiny': true,
          'not-shiny': false,
        }),
      },
    }))}
    size='sm'
    style={{ flexGrow: 1 }}
  />;
};
