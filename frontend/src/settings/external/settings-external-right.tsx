import { Card, Group } from '@mantine/core';
import { ExternalLinkIcon } from 'lucide-react';
import type React from "react";
import { useFormContext, useWatch } from 'react-hook-form';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import type { SettingsFormData } from '../../pages/settings';
import { useTranslate } from '../../translate/i18n';
import { GlobsInputList } from '../globs-input/globs-input-list';

export const SettingsExternalRight: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const form = useFormContext<SettingsFormData>();

    const [ pkmExternalGlobs ] = useWatch({ control: form.control, name: [ 'pkM_EXTERNAL_GLOBS' ] });

    return <Card style={{ overflow: 'auto' }}>
        <GlobsInputList
            labelList={<Group>
                {t('settings.form.pkms-external')}
                <ExternalLinkIcon />
            </Group>}
            labelAddFile={t('settings.form.pkms-external.add-file')}
            labelAddFolder={t('settings.form.pkms-external.add-folder')}
            labelAddPath={t('settings.form.pkms-external.add-path')}
            {...form.register('pkM_EXTERNAL_GLOBS')}
            value={pkmExternalGlobs}
            onChange={(value) => form.setValue('pkM_EXTERNAL_GLOBS', value, { shouldDirty: true })}
            disabled={!settings?.canUpdateSettings}
            limit={1200}
        />
    </Card>;
};
