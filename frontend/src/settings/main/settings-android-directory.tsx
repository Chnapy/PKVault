import { Input, Stack, Text } from '@mantine/core';
import React from 'react';
import { DesktopMessageType } from '../../data/sdk/model';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui/form/button/ui-button';
import { UIPathButton } from '../../ui/form/globs-input/ui-path-button';
import { getDesktopFileTypeInfos } from '../../ui/form/globs-input/util/get-desktop-file-type-infos';
import { UIBallIcon } from '../../ui/icon/ui-ball-icon';
import { UIPathLine } from '../../ui/path/ui-path-line';
import { UIFormCard } from '../../ui/popover/popover-card/ui-form-card';
import { useDesktopMessage } from '../globs-input/hooks/use-desktop-message';

export const SettingsAndroidDirectory: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const [ nextPath_, setNextPath ] = React.useState(settings?.appDirectory);

    const desktopMessage = useDesktopMessage();

    if (!settings)
        return null;

    const nextPath = nextPath_ ?? settings.appDirectory;
    const initialPath = '/data/data/io.github.chnapy.pkvault';

    return <UIFormCard
        onSubmit={nextPath === settings.appDirectory
            ? undefined
            : async e => {
                e.preventDefault();
                e.stopPropagation();

                await desktopMessage.androidPkvaultDirectory!({
                    type: DesktopMessageType.ANDROID_PKVAULT_DIRECTORY,
                    id: 0,
                    directoryOnly: true,
                    basePath: nextPath,
                    multiselect: false,
                });
            }}
        icon={<UIBallIcon />}
        title='Change PKVault directory'
        description='Allow PKVault files to be accessed from other apps'
        disabled={nextPath === settings.appDirectory}
    >
        <Stack align='center'>
            <Input.Wrapper label='PKVault directory' description='Most PKVault files will be moved to this target'>
                <UIPathButton
                    value={nextPath}
                    pkvaultPath={settings.appDirectory}
                    uploadPath={settings.savesUploadsPath}
                    icons={null}
                    onClick={async e => {
                        const basePath = settings.appDirectory;

                        const desktopInfos = getDesktopFileTypeInfos('folder');

                        const response = await desktopMessage.fileExplore!({
                            type: DesktopMessageType.FILE_EXPLORE,
                            id: desktopInfos.id,
                            directoryOnly: desktopInfos.directoryOnly,
                            basePath,
                            multiselect: false,
                        });

                        const newValue = desktopInfos.getFinalPaths(response?.values ?? [])[ 0 ];
                        if (!newValue)
                            return;

                        setNextPath(newValue);
                    }}
                />
            </Input.Wrapper>

            {nextPath !== initialPath &&
                <Input.Wrapper description='Or reset to initial app folder'>
                    <UIButton
                        name='reset'
                        controlLabel={t('action.select')}
                        onClick={() => setNextPath(initialPath)}
                        size='compact-md'
                        fw='normal'
                    >
                        <UIPathLine>
                            {initialPath}
                        </UIPathLine>
                    </UIButton>
                </Input.Wrapper>}

            <Text lh={1.2}>
                Most files will be copied to target directory.
                <br />Source files won't be deleted.
                <br />Once submitted, restart PKVault.
            </Text>
        </Stack>
    </UIFormCard>;
};
