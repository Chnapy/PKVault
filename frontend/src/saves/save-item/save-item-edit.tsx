import { Alert, Button, Divider, Group, InputWrapper, Stack } from '@mantine/core';
import { PencilIcon, PenOffIcon, TrashIcon, TriangleAlertIcon } from 'lucide-react';
import React from 'react';
import { type GameVersion } from '../../data/sdk/model';
import { useSaveInfosDelete, useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useSettingsEdit, useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { isDesktop } from '../../settings/globs-input/hooks/use-desktop-message';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui/form/button/ui-button';
import { UIPopoverCard } from '../../ui/popover/popover-card/ui-popover-card';
import { UIConfirmPopover } from '../../ui/popover/ui-confirm-popover';
import { UIGameImg } from '../../ui/sprite-img/ui-game-img';
import { UIGameExpanded } from '../../ui/storage/storage-panel/game-list/ui-game-expanded';
import { gameExpandedConstants } from '../../ui/storage/storage-panel/game-list/util/game-expanded-constants';

export const SaveItemEdit: React.FC<{ saveId: number }> = ({ saveId }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();
    const saveInfosQuery = useSaveInfosGetAll();

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const settingsEdit = useSettingsEdit();
    const saveDeleteMutation = useSaveInfosDelete();

    const settingsMutable = settingsQuery.data?.data.settingsMutable;

    const save = saveInfosQuery.data?.data[ saveId ];
    const versionObj = staticData.versions[ save?.version ?? '' ];
    if (!save || !settingsMutable) {
        return null;
    }

    const savesByPlayTime = [ save, ...save.duplicates ].sort((s1, s2) => s2.playTimeInSeconds - s1.playTimeInSeconds);
    const versions = [ ...new Set([ save.version, ...versionObj?.children ?? [] ]) ];

    const pathOverride = settingsMutable.savE_PATH_OVERRIDES?.[ save.id ];
    const pathNotPresent = !!pathOverride && !savesByPlayTime.some(s => s.path === pathOverride);

    return <UIPopoverCard
        icon={<PencilIcon />}
        title={t('save.edit.title')}
    >
        <Group align='flex-start' gap='lg'>
            {savesByPlayTime.length > 1 && <Stack>
                <InputWrapper
                    label={t('save.edit.duplicate.title')}
                    description={t('save.edit.duplicate.description')}
                    size='md'
                />

                {!settings?.canUpdateSettings && <Alert variant='outline' color='blue' icon={<PenOffIcon />} maw={gameExpandedConstants.width} py='sm'>
                    {t('action.edit-not-possible')}
                </Alert>}

                <Stack>
                    <UIButton
                        name={'default'}
                        controlLabel={t('action.select')}
                        onClick={async () => {
                            const savePathOverrides = { ...settingsMutable.savE_PATH_OVERRIDES };

                            delete savePathOverrides[ save.id ];

                            await settingsEdit.mutateAsync({
                                data: {
                                    ...settingsMutable,
                                    savE_PATH_OVERRIDES: savePathOverrides,
                                },
                            });
                        }}
                        selected={!pathOverride}
                        disabled={settings?.demoMode || !settings?.canUpdateSettings || !pathOverride}
                        size='compact-sm'
                    >
                        {t('save.edit.duplicate.default')}
                    </UIButton>

                    {pathNotPresent && <UIGameExpanded
                        generation={getEntityContextGenerationName(save.context, true)}
                        label={staticData.versions[ save.displayedVersion ]?.name}
                        imgSrc={getGameInfos(save.displayedVersion).img}
                        selected
                        disabled
                        path={pathOverride}
                        missingFile
                        editDropdown={null}
                        actions={null}
                    />}

                    {savesByPlayTime.map(s => <React.Fragment key={s.path}>
                        <UIGameExpanded
                            id={s.id.toString()}
                            generation={getEntityContextGenerationName(s.context, true)}
                            label={staticData.versions[ s.displayedVersion ]?.name}
                            imgSrc={getGameInfos(s.displayedVersion).img}
                            selected={save === s}
                            disabled={pathOverride === s.path}
                            onSelect={settings?.demoMode || settings?.canUpdateSettings
                                ? (async () => {
                                    const savePathOverrides = { ...settingsMutable.savE_PATH_OVERRIDES };
                                    if (s.path === savePathOverrides[ s.id ]) {
                                        return;
                                    }

                                    savePathOverrides[ s.id ] = s.path;

                                    await settingsEdit.mutateAsync({
                                        data: {
                                            ...settingsMutable,
                                            savE_PATH_OVERRIDES: savePathOverrides,
                                        },
                                    });
                                })
                                : undefined}
                            ot={s.trainerName}
                            otGender={s.trainerGender}
                            tid={s.tid}
                            playTime={s.playTime}
                            language={staticData.languages[ s.language ] ?? ''}
                            path={s.path}
                            editDropdown={null}
                            actions={!isDesktop && <>
                                <UIConfirmPopover
                                    label={t('saves.action.delete')}
                                    icon={<TriangleAlertIcon />}
                                    color='red'
                                    action={() => saveDeleteMutation.mutateAsync({
                                        params: { path: s.path },
                                    })}
                                    nested
                                >
                                    <Button
                                        disabled={settings?.demoMode || !settings?.canUpdateSettings}
                                        variant='filled'
                                        color='red'
                                        size='compact-xs'
                                        fullWidth
                                    >
                                        <TrashIcon />
                                    </Button>
                                </UIConfirmPopover>
                            </>}
                        />
                    </React.Fragment>)}
                </Stack>
            </Stack>}

            {versions.length > 1 && <Stack miw={200}>
                <InputWrapper
                    label={t('save.edit.version.title')}
                    description={t('save.edit.version.description')}
                    size='md'
                />

                <Stack>
                    {versions.map(vers => ({
                        value: vers,
                        option: <>{t('save.pkm')} {staticData.versions[ vers ]?.name}</>,
                    })).map(item => <React.Fragment key={item.value}>
                        <Group>
                            <UIGameImg
                                version={item.value}
                            />

                            <UIButton
                                name={`version-${item.value}`}
                                controlLabel={t('action.select')}
                                focusOnMount={item.value === save.displayedVersion}
                                selected={item.value === save.displayedVersion}
                                disabled={settingsEdit.isPending || item.value === save.displayedVersion}
                                onClick={async () => {
                                    const version = item.value;
                                    if (version === save.displayedVersion) {
                                        return;
                                    }

                                    const saveVersionOverrides = { ...settingsMutable.savE_VERSION_OVERRIDES };

                                    if (version === save.version) {
                                        delete saveVersionOverrides[ save.id ];
                                    } else {
                                        saveVersionOverrides[ save.id ] = version as GameVersion;
                                    }

                                    await settingsEdit.mutateAsync({
                                        data: {
                                            ...settingsMutable,
                                            savE_VERSION_OVERRIDES: saveVersionOverrides,
                                        },
                                    });
                                }}
                                color={getGameInfos(item.value).color}
                                variant='filled'
                                autoContrast
                                style={{ flexGrow: 1 }}
                            >
                                {item.option}
                            </UIButton>
                        </Group>

                        {item.value === save.version && <Divider />}
                    </React.Fragment>)}
                </Stack>
            </Stack>}

        </Group>
    </UIPopoverCard>;
};
