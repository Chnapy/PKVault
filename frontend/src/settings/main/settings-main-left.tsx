import { Card, SimpleGrid } from '@mantine/core';
import { FileIcon, FolderIcon, GlobeIcon, PenOffIcon, ShieldOff } from 'lucide-react';
import type React from "react";
import { useFormContext } from 'react-hook-form';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import type { SettingsFormData } from '../../pages/settings';
import { languages, useTranslate } from '../../translate/i18n';
import { UISelect } from '../../ui/form/select/ui-select';
import { UISwitch } from '../../ui/form/switch/ui-switch';
import { UIInputLabel } from '../../ui/form/ui-input-label';
import { UIBallIcon } from '../../ui/icon/ui-ball-icon';
import { UIPathLine } from '../../ui/path/ui-path-line';

export const SettingsMainLeft: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    // const settingsMutation = useSettingsEdit();

    const settings = settingsQuery.data?.data;
    // const settingsMutable = settings?.settingsMutable;

    const form = useFormContext<SettingsFormData>();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<UIBallIcon />} label='PKVault' />
                <div>v{settings?.version}</div>
                <UIInputLabel leftSection={<img src="https://projectpokemon.org/favicon.ico" />} label='PKHeX' />
                <div>{settings?.pkhexVersion}</div>
                <UIInputLabel leftSection={<FolderIcon />} label={t('settings.relative-paths')} />
                <UIPathLine>{settings?.appDirectory ?? '-'}</UIPathLine>
                <UIInputLabel leftSection={<FileIcon />} label={t('settings.form.config')} />
                <UIPathLine>{settings?.settingsPath ?? '-'}</UIPathLine>
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<GlobeIcon />} forInput='language' label={t('settings.form.language')} />
                <UISelect
                    {...form.register('language')}
                    controlLabel={t('settings.form.language')}
                    data={Object.entries(languages)
                        .map(([ value, label ]) => ({ value, label }))}
                    disabled={!settings?.canUpdateSettings}
                />
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<PenOffIcon />} forInput='hidE_CHEATS'
                    label={t('settings.form.hide-cheats')}
                    description={t('settings.form.hide-cheats.description')}
                />
                <UISwitch
                    {...form.register('hidE_CHEATS')}
                    defaultChecked={form.getValues('hidE_CHEATS')}
                    controlLabel={t('settings.form.hide-cheats')}
                    disabled={!settings?.canUpdateSettings}
                    ml='auto'
                    my='sm'
                />

                <UIInputLabel leftSection={<ShieldOff />} forInput='skiP_LEGALITY_CHECKS'
                    label={t('settings.form.skip-legality')}
                    description={t('settings.form.skip-legality.description')}
                />
                <UISwitch
                    {...form.register('skiP_LEGALITY_CHECKS')}
                    defaultChecked={form.getValues('skiP_LEGALITY_CHECKS')}
                    controlLabel={t('settings.form.skip-legality')}
                    disabled={!settings?.canUpdateSettings}
                    ml='auto'
                    mt='sm'
                />
            </SimpleGrid>
        </Card>
    </>;
};
