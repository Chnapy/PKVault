import { Card } from '@mantine/core';
import type React from "react";
import { useFormContext, useWatch } from 'react-hook-form';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import type { SettingsFormData } from '../../pages/settings';
import { useTranslate } from '../../translate/i18n';
import { GlobsInputItem } from '../globs-input/globs-input-item';
import { GlobsInputList } from '../globs-input/globs-input-list';
import { isDesktop } from '../globs-input/hooks/use-desktop-message';

export const SettingsMainRight: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const form = useFormContext<SettingsFormData>();

    const [ saveGlobs ] = useWatch({ control: form.control, name: [ 'savE_GLOBS' ] });

    return <Card>
        <GlobsInputList
            labelList={t('settings.form.saves')}
            labelAddFile={t('settings.form.saves.add-file')}
            labelAddFolder={t('settings.form.saves.add-folder')}
            labelAddPath={t('settings.form.saves.add-path')}
            // {...form.register('savE_GLOBS')}
            name='savE_GLOBS'
            value={saveGlobs}
            onChange={(value) => form.setValue('savE_GLOBS', value, { shouldDirty: true })}
            disabled={!settings?.canUpdateSettings}
            limit={200}
        >
            {!isDesktop && settings && <GlobsInputItem
                name='uploads-path'
                value={settings.savesUploadsPath}
                disabled
                limit={200}
            />}
        </GlobsInputList>
    </Card>;
};
