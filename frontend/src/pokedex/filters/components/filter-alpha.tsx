import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UISegmentedControl, type UISegmentedControlProps } from '../../../ui/form/select/ui-segmented-control';
import { UIAlphaIcon } from '../../../ui/icon/ui-alpha-icon';
import { switchUtil } from '../../../util/switch-util';

export const FilterAlpha: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const data = [
    { value: 'all', label: t('all') },
    { value: 'alpha', label: <UIAlphaIcon /> },
    { value: 'not-alpha', label: <UIAlphaIcon disabled /> },
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
    controlLabel={t('dex.filters.alpha')}
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
