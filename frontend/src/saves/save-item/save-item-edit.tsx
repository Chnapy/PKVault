import { Divider, Group } from '@mantine/core';
import { PencilIcon } from 'lucide-react';
import React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useSettingsEdit, useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui-new/form/button/ui-button';
import { usePopover } from '../../ui-new/interaction/focus-controls/components/popover/hooks/use-popover';
import { UIPopoverCard } from '../../ui-new/popover/popover-card/ui-popover-card';
import { UIGameImg } from '../../ui-new/sprite-img/ui-game-img';

export const SaveItemEdit: React.FC<{ saveId: number }> = ({ saveId }) => {
    const { t } = useTranslate();

    const popover = usePopover();

    const staticData = useStaticData();
    const saveInfosQuery = useSaveInfosGetAll();

    const settingsQuery = useSettingsGet();
    const settingsEdit = useSettingsEdit();

    const settingsMutable = settingsQuery.data?.data.settingsMutable;

    const save = saveInfosQuery.data?.data[ saveId ];
    const versionObj = staticData.versions[ save?.version ?? '' ];
    if (!save || !versionObj || !settingsMutable) {
        return null;
    }

    return <UIPopoverCard
        icon={<PencilIcon />}
        title='Edit save version'
    >
        {[ ...new Set([ save.version, ...versionObj.children ]) ].map(vers => ({
            value: vers,
            option: <>{t('save.pkm')} {staticData.versions[ vers ]?.name}</>,
        })).map(item => <React.Fragment key={item.value}>
            <Group>
                <UIGameImg
                    version={item.value}
                />

                <UIButton
                    name={`version-${item.value}`}
                    controlLabel='Set version'
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

                        popover?.setOpened(false);
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
    </UIPopoverCard>;
};
