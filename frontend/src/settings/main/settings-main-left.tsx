import { Card, SimpleGrid } from '@mantine/core';
import { FileIcon, FolderIcon, Gamepad2Icon, GlobeIcon, PenOffIcon, ShieldOffIcon } from 'lucide-react';
import type React from "react";
import { useFormContext, useWatch } from 'react-hook-form';
import { RuntimeSystem } from '../../data/sdk/model';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import type { SettingsFormData } from '../../pages/settings';
import { languages, useTranslate } from '../../translate/i18n';
import { UISelect } from '../../ui/form/select/ui-select';
import { UISwitch } from '../../ui/form/switch/ui-switch';
import { UIInputLabel } from '../../ui/form/ui-input-label';
import { UIBallIcon } from '../../ui/icon/ui-ball-icon';
import { useControlsContext } from '../../ui/interaction/controls/provider/use-controls-context';
import { UIPathLine } from '../../ui/path/ui-path-line';
import { switchUtil } from '../../util/switch-util';

export const SettingsMainLeft: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const form = useFormContext<SettingsFormData>();

    const [ language ] = useWatch({ control: form.control, name: [ 'language' ] });

    const { enableGamepad, toggleGamepad } = useControlsContext();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<UIBallIcon />} label='PKVault' />
                <div>v{settings?.version} - {switchUtil(settings?.runtimeSystem ?? 0, {
                    [ RuntimeSystem.UNKNOWN ]: t('settings.system.unknown'),
                    [ RuntimeSystem.DOCKER ]: 'Docker',
                    [ RuntimeSystem.WINDOWS ]: t('settings.system.windows'),
                    [ RuntimeSystem.LINUX ]: t('settings.system.linux'),
                    [ RuntimeSystem.STEAMDECK ]: t('settings.system.steamdeck'),
                    [ RuntimeSystem.MACOS ]: t('settings.system.macos'),
                    [ RuntimeSystem.ANDROID ]: t('settings.system.android'),
                })}</div>
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
                    name='language'
                    controlLabel={t('settings.form.language')}
                    value={language}
                    data={Object.entries(languages)
                        .map(([ value, label ]) => ({ value, label }))}
                    onChange={value => value && form.setValue('language', value, { shouldDirty: true })}
                    scrollAreaProps={{ type: 'always' }}
                />
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2} spacing={0} verticalSpacing='md'>
                <UIInputLabel leftSection={<PenOffIcon />} forInput='hidE_CHEATS'
                    label={t('settings.form.hide-cheats')}
                    description={t('settings.form.hide-cheats.description')}
                />
                <UISwitch
                    {...form.register('hidE_CHEATS')}
                    defaultChecked={form.getValues('hidE_CHEATS')}
                    controlLabel={t('settings.form.hide-cheats')}
                    ml='auto'
                    my='sm'
                />

                <UIInputLabel leftSection={<ShieldOffIcon />} forInput='skiP_LEGALITY_CHECKS'
                    label={t('settings.form.skip-legality')}
                    description={t('settings.form.skip-legality.description')}
                />
                <UISwitch
                    {...form.register('skiP_LEGALITY_CHECKS')}
                    defaultChecked={form.getValues('skiP_LEGALITY_CHECKS')}
                    controlLabel={t('settings.form.skip-legality')}
                    ml='auto'
                    mt='sm'
                />

                <UIInputLabel leftSection={<Gamepad2Icon />} forInput='enable-gamepad'
                    label={t('settings.form.enable-gamepad')}
                    description={t('settings.form.enable-gamepad.description')}
                />
                <UISwitch
                    name='enable-gamepad'
                    checked={enableGamepad}
                    onChange={toggleGamepad}
                    controlLabel={t('settings.form.enable-gamepad')}
                    ml='auto'
                    mt='sm'
                />
            </SimpleGrid>
        </Card>
    </>;
};
