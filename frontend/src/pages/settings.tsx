import { Alert, Card, Center, Group, Stack } from '@mantine/core';
import { CornerRightDownIcon, InfoIcon, SaveIcon } from 'lucide-react';
import React from "react";
import { FormProvider, useForm } from 'react-hook-form';
import type { SettingsMutableDTO } from '../data/sdk/model';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { withErrorCatcher } from '../error/with-error-catcher';
import { Route } from '../routes/settings';
import { SettingsBackupLeft } from '../settings/backup/settings-backup-left';
import { SettingsBackupRight } from '../settings/backup/settings-backup-right';
import { SettingsExternalLeft } from '../settings/external/settings-external-left';
import { SettingsExternalRight } from '../settings/external/settings-external-right';
import { SettingsMainLeft } from '../settings/main/settings-main-left';
import { SettingsMainRight } from '../settings/main/settings-main-right';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui-new/form/button/ui-button';
import { UISettingsContent } from '../ui-new/settings/ui-settings-content';
import { switchUtil } from '../util/switch-util';

export type SettingsFormData = Omit<SettingsMutableDTO, 'savE_GLOBS' | 'pkM_EXTERNAL_GLOBS'> & {
  savE_GLOBS: string;
  pkM_EXTERNAL_GLOBS: string;
};

const settingsToFormData = (settingsMutable: SettingsMutableDTO) => ({
  ...settingsMutable,
  savE_GLOBS: settingsMutable.savE_GLOBS.join('\n'),
  pkM_EXTERNAL_GLOBS: settingsMutable.pkM_EXTERNAL_GLOBS?.join('\n') ?? ''
});

export const SettingsPage: React.FC = withErrorCatcher('default', () => {
  console.log('page settings');

  const { t } = useTranslate();

  const subMenu = Route.useSearch({ select: search => search.subMenu ?? 'main' });

  // const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

  // const desktopMessage = useDesktopMessage();

  const settingsQuery = useSettingsGet();
  const settingsMutation = useSettingsEdit();

  const settings = settingsQuery.data?.data;
  const settingsMutable = settings?.settingsMutable;

  const defaultValue = React.useMemo((): SettingsFormData | undefined => settingsMutable
    && settingsToFormData(settingsMutable), [ settingsMutable ]);

  const form = useForm<SettingsFormData>({
    defaultValues: defaultValue,
  });

  if (!settingsMutable) {
    return null;
  }

  const submit = form.handleSubmit(async (data) => {
    const result = await settingsMutation.mutateAsync({
      data: {
        ...data,
        savE_GLOBS: data.savE_GLOBS.split('\n').map(value => value.trim()).filter(Boolean),
        pkM_EXTERNAL_GLOBS: data.pkM_EXTERNAL_GLOBS.split('\n').map(value => value.trim()).filter(Boolean)
      },
    });

    const nextSettingsMutable = result.data.settings?.settingsMutable;
    if (nextSettingsMutable)
      form.reset(settingsToFormData(nextSettingsMutable), { keepDefaultValues: false });
  });

  const { left, right } = switchUtil(subMenu, {
    main: () => ({
      left: <SettingsMainLeft />,
      right: <SettingsMainRight />,
    }),
    "external-pkms": () => ({
      left: <SettingsExternalLeft />,
      right: <SettingsExternalRight />,
    }),
    backups: () => ({
      left: <SettingsBackupLeft />,
      right: <SettingsBackupRight />,
    }),
  })();

  return <FormProvider {...form}>
    <UISettingsContent
      key={subMenu}
      onSubmit={submit}
      left={left}
      right={right}
      bottom={<Center>
        <Card>
          <Stack align='center'>
            <Group wrap='nowrap'>
              <UIButton
                name='cancel'
                controlLabel={t('action.cancel')}
                onClick={() => form.reset(defaultValue)}
                disabled={!settings.canUpdateSettings || !form.formState.isDirty}
              >
                {t('action.cancel')}
              </UIButton>

              <UIButton
                name='submit'
                controlLabel={t('action.submit')}
                type='submit'
                variant='filled'
                color='blue'
                leftSection={<SaveIcon />}
                loading={settingsMutation.isPending}
                disabled={!settings.canUpdateSettings || !form.formState.isDirty}
              >
                {t('action.submit')}
              </UIButton>
            </Group>
            {!settings.canUpdateSettings && <Alert variant='outline' color='blue' icon={<InfoIcon />}>
              <Group>
                {t('action.not-possible')} <CornerRightDownIcon style={{ alignSelf: 'flex-end' }} />
              </Group>
            </Alert>}
          </Stack>
        </Card>
      </Center>}
    />
  </FormProvider>;
});
