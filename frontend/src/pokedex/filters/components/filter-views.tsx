import { Checkbox, Group } from '@mantine/core';
import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../../ui/form/button/ui-button';

export const FilterViews: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const allValues = [ 'display-forms', 'display-genders', 'display-living-dex' ] as const;

  const value = [
    Route.useSearch({ select: (search) => search.showForms ? allValues[ 0 ] : undefined }),
    Route.useSearch({ select: (search) => search.showGenders ? allValues[ 1 ] : undefined }),
    Route.useSearch({ select: (search) => search.showLivingDex ? allValues[ 2 ] : undefined }),
  ].filter(v => typeof v === 'string');

  return <Checkbox.Group
    value={value}
    onChange={(values) => startTransition(() => navigate({
      search: {
        showForms: values.includes('display-forms') || undefined,
        showGenders: values.includes('display-genders') || undefined,
        showLivingDex: values.includes('display-living-dex') || undefined,
      },
    }))}
  >
    <Group grow wrap='wrap'>
      <Checkbox.Card
        renderRoot={props => <UIButton
          name={allValues[ 0 ]}
          controlLabel={t('dex.filters.forms')}
          leftSection={<Checkbox.Indicator />}
          styles={{
            label: {
              flexGrow: 1,
            },
          }}
          {...props}
        />}
        value={allValues[ 0 ]}
      >
        {t('dex.filters.forms')}
      </Checkbox.Card>

      <Checkbox.Card
        renderRoot={props => <UIButton
          name={allValues[ 1 ]}
          controlLabel={t('dex.filters.genders')}
          leftSection={<Checkbox.Indicator />}
          styles={{
            label: {
              flexGrow: 1,
            },
          }}
          {...props}
        />}
        value={allValues[ 1 ]}
      >
        {t('dex.filters.genders')}
      </Checkbox.Card>

      <Checkbox.Card
        renderRoot={props => <UIButton
          name={allValues[ 2 ]}
          controlLabel={t('dex.filters.living-dex')}
          leftSection={<Checkbox.Indicator />}
          styles={{
            label: {
              flexGrow: 1,
            },
          }}
          {...props}
        />}
        value={allValues[ 2 ]}
      >
        {t('dex.filters.living-dex')}
      </Checkbox.Card>
    </Group>
  </Checkbox.Group>;
};
