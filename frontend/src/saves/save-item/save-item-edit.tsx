import { css } from '@emotion/css';
import React from 'react';
import type { GameVersion } from '../../data/sdk/model';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { useSettingsEdit, useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { ButtonWithPopover } from '../../ui/button/button-with-popover';
import { Icon } from '../../ui/icon/icon';

export const SaveItemEdit: React.FC<{ saveId: number }> = ({ saveId }) => {
    const { t } = useTranslate();

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

    return <ButtonWithPopover
        anchor='right start'
        panelContent={close => <div
            className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            })}
        >
            {[ ...new Set([ save.version, ...versionObj.children ]) ].map(vers => ({
                value: vers,
                option: <>{t('save.pkm')} {staticData.versions[ vers ]?.name}</>,
            })).map(item => <React.Fragment key={item.value}>
                <Button
                    value={item.value}
                    disabled={item.value === save.displayedVersion}
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

                        close();
                    }}
                >
                    {item.option}
                </Button>

                {item.value === save.version && <hr className={css({
                    width: '80%',
                    borderTop: 'none',
                })} />}
            </React.Fragment>)}
        </div>}
    >
        <Icon name='pen' forButton />
    </ButtonWithPopover>;
};
