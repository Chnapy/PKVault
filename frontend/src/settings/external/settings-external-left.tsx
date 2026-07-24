import { Card, SimpleGrid } from '@mantine/core';
import { ExternalLinkIcon, FolderTreeIcon, ShieldCheckIcon } from 'lucide-react';
import type React from "react";
import { UIInputLabel } from '../../ui/form/ui-input-label';

export const SettingsExternalLeft: React.FC = () => {
    // const { t } = useTranslate();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<ExternalLinkIcon />} label='External PKM files' align='flex-start' />
                <div>
                    PKM files (.pk*) from your own storage.
                </div>

                <UIInputLabel leftSection={<FolderTreeIcon />} label='Data generation' align='flex-start' />
                <div>
                    Generate banks, boxes and pkms on PKVault start (or data reload) from your file tree structure.
                </div>

                <UIInputLabel leftSection={<ShieldCheckIcon />} label='Safety' align='flex-start' />
                <div>
                    External PKM files are read only, your files cannot be changed from PKVault.
                </div>
            </SimpleGrid>
        </Card>
    </>;
};
