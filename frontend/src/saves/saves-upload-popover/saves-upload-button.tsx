import type React from 'react';
import { useSaveInfosUpload } from '../../data/sdk/save-infos/save-infos.gen';
import { useSettingsGet, useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { UISavesUploadDropdown } from '../../ui/saves/saves-upload-popover/ui-saves-upload-dropdown';
import { UISavesUploadButton, type UISavesUploadButtonProps } from '../../ui/saves/saves-upload-popover/ui-saves-upload-button';

type SavesUploadButtonProps = Omit<UISavesUploadButtonProps, 'dropdown'>;

export const SavesUploadButton: React.FC<SavesUploadButtonProps> = (props) => {
    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    return <UISavesUploadButton
        {...props}
        dropdown={<SavesUploadDropdown />}
        disabled={props.disabled || settings?.demoMode}
    />;
};

const SavesUploadDropdown: React.FC = () => {
    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const uploadMutation = useSaveInfosUpload();

    const globResultsQuery = useSettingsGetSaveGlobsResults({
        globs: settings
            ? [ settings.savesUploadsPath ]
            : [],
        limit: 500,
    });
    const globResults = globResultsQuery.data?.data ?? [];

    const loading = [ settingsQuery, globResultsQuery ].some(q => q.isPending && q.isEnabled);

    return <UISavesUploadDropdown
        globResults={globResults}
        savesUploadsPath={settings?.savesUploadsPath ?? ''}
        loading={loading}
        onSubmit={async data => {
            await uploadMutation.mutateAsync({
                params: {
                    saveFilesNames: data.files.map(f => f.customName),
                    overwrite: data.overwrite,
                },
                data: {
                    saveFiles: data.files.map(f => f.file),
                },
            });
        }}
    />;
};
