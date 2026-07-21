import { Card, SimpleGrid } from '@mantine/core';
import { FileIcon, FolderIcon, GlobeIcon, PenOffIcon, ShieldOff } from 'lucide-react';
import type React from "react";
import { useFormContext } from 'react-hook-form';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import type { SettingsFormData } from '../../pages/settings';
import { useTranslate } from '../../translate/i18n';
import { UISelect } from '../../ui-new/form/select/ui-select';
import { UISwitch } from '../../ui-new/form/switch/ui-switch';
import { UIInputLabel } from '../../ui-new/form/ui-input-label';
import { UIBallIcon } from '../../ui-new/icon/ui-ball-icon';
import { UIPathLine } from '../../ui-new/path/ui-path-line';

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
                <div>v{settings?.version} - SteamDeck - Flatpak</div>
                <UIInputLabel leftSection={<img src="https://projectpokemon.org/favicon.ico" />} label='PKHeX' />
                <div>{settings?.pkhexVersion}</div>
                <UIInputLabel leftSection={<FolderIcon />} label='PKVault path' />
                <UIPathLine>{settings?.appDirectory ?? '-'}</UIPathLine>
                <UIInputLabel leftSection={<FileIcon />} label='Config path' />
                <UIPathLine>{settings?.settingsPath ?? '-'}</UIPathLine>
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<GlobeIcon />} forInput='language' label={t('settings.form.language')} />
                <UISelect
                    {...form.register('language')}
                    controlLabel={t('settings.form.language')}
                    data={[
                        { value: 'en', label: 'English' },
                        { value: 'fr', label: 'Français' },
                        { value: 'de', label: 'Deutsch' },
                    ]}
                    disabled={!settings?.canUpdateSettings}
                />
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<PenOffIcon />} forInput='hidE_CHEATS'
                    label={t('settings.form.hide-cheats')}
                    description='Remove moves & EVs from pokemon edit'
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
                    description='If not concerned by online usage'
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
