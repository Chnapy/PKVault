import { EyeOffIcon } from 'lucide-react';
import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui/form/select/ui-segmented-control';
import { UIPokedexIcons } from '../../../ui/pokedex/icons/ui-pokedex-icons';
import { switchUtil } from '../../../util/switch-util';

export const FilterSeen: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: t('all') },
    { value: 'seen', label: <UIPokedexIcons.Seen size='xs' fz='1rem' /> },
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
    controlLabel={t('dex.filters.seen')}
    value={currentValue}
    data={data}
    onChange={(value) => startTransition(() => navigate({
      search: {
        filterSeen: switchUtil(value, {
          'all': undefined,
          'seen': true,
          'not-seen': false,
        }),
      },
    }))}
    size='sm'
    style={{ flexGrow: 1 }}
  />;
};
