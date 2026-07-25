import { Card, SimpleGrid } from '@mantine/core';
import { ExternalLinkIcon, FolderTreeIcon, ShieldCheckIcon } from 'lucide-react';
import type React from "react";
import { useTranslate } from '../../translate/i18n';
import { UIInputLabel } from '../../ui/form/ui-input-label';

export const SettingsExternalLeft: React.FC = () => {
    const { t } = useTranslate();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<ExternalLinkIcon />} label={t('settings.external.1.label')} align='flex-start' />
                <div>
                    {t('settings.external.1.description')}
                </div>

                <UIInputLabel leftSection={<FolderTreeIcon />} label={t('settings.external.2.label')} align='flex-start' />
                <div>
                    {t('settings.external.2.description')}
                </div>

                <UIInputLabel leftSection={<ShieldCheckIcon />} label={t('settings.external.3.label')} align='flex-start' />
                <div>
                    {t('settings.external.3.description')}
                </div>
            </SimpleGrid>
        </Card>
    </>;
};
