import { Checkbox, Group } from '@mantine/core';
import React, { startTransition } from "react";
import { Route } from "../../../routes/pokedex";
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../../ui-new/form/button/ui-button';

export const FilterViews: React.FC = () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const allValues = [ 'display-forms', 'display-genders' ] as const;

  const value = [
    Route.useSearch({ select: (search) => search.showForms ? allValues[ 0 ] : undefined }),
    Route.useSearch({ select: (search) => search.showGenders ? allValues[ 1 ] : undefined }),
  ].filter(v => typeof v === 'string');

  return <Checkbox.Group
    value={value}
    onChange={(values) => startTransition(() => navigate({
      search: {
        showForms: values.includes('display-forms') || undefined,
        showGenders: values.includes('display-genders') || undefined,
      },
    }))}
  >
    <Group grow wrap='nowrap'>
      <Checkbox.Card
        renderRoot={props => <UIButton
          name={allValues[ 0 ]}
          controlLabel={t('dex.filters.show-forms.yes')}
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
        Forms
      </Checkbox.Card>

      <Checkbox.Card
        renderRoot={props => <UIButton
          name={allValues[ 1 ]}
          controlLabel={t('dex.filters.show-genders.yes')}
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
        Genders
      </Checkbox.Card>
    </Group>
  </Checkbox.Group>;
};
