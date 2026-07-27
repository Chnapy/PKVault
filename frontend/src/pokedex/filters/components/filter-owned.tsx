import { FolderXIcon } from 'lucide-react';
import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui/form/select/ui-segmented-control';
import { UIPokedexIcons } from '../../../ui/pokedex/icons/ui-pokedex-icons';
import { switchUtil } from '../../../util/switch-util';

export const FilterOwned: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: t('all') },
    { value: 'owned', label: <UIPokedexIcons.Owned size='xs' fz='1rem' /> },
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
    controlLabel={t('dex.filters.owned')}
    value={currentValue}
    data={data}
    onChange={(value) => startTransition(() => navigate({
      search: {
        filterOwned: switchUtil(value, {
          'all': undefined,
          'owned': true,
          'not-owned': false,
        }),
      },
    }))}
    size='sm'
    style={{ flexGrow: 1 }}
  />;
};
