import type React from 'react';
import type { PkmVersionWarning as PkmVersionWarningModel } from '../data/sdk/model';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { useStaticData } from '../hooks/use-static-data';
import { Route } from '../routes/storage';
import { getSaveOrder } from '../storage/util/get-save-order';
import { useTranslate } from '../translate/i18n';
import { Button } from '../ui/button/button';
import { Icon } from '../ui/icon/icon';

export const PkmVersionWarning: React.FC<PkmVersionWarningModel> = ({ pkmId }) => {
    const { t } = useTranslate();
    const navigate = Route.useNavigate();

    const staticData = useStaticData();

    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkm = pkmsQuery.data?.data.find(pkm => pkm.id == pkmId);
    const pkmVersion = pkmVersionsQuery.data?.data.find(pkmVersion => pkmVersion.pkmId === pkmId);

    if (!pkm || !pkmVersion) {
        return null;
    }

    const staticForms = staticData.species[ pkmVersion.species ].forms[ pkmVersion.generation ];

    const formObj = staticForms[ pkmVersion.form ] ?? staticForms[ 0 ];

    const speciesName = formObj.name;

    return <tr>
        <td>
            {t('notifications.warnings.pkm-version', { speciesName, boxId: pkm.boxId, boxSlot: pkm.boxSlot })}
        </td>
        <td style={{ verticalAlign: 'top' }}>
            <Button onClick={() => navigate({
                to: '/storage',
                search: ({ saves }) => ({
                    mainBoxIds: [ pkm.boxId ],
                    selected: {
                        id: pkm.id,
                    },
                    saves: pkm.saveId ? {
                        ...saves,
                        [ pkm.saveId ]: saves?.[ pkm.saveId ] ?? {
                            saveId: pkm.saveId,
                            saveBoxIds: [ 0 ],
                            order: getSaveOrder(saves, pkm.saveId),
                        }
                    } : saves,
                })
            })}>
                <Icon name='eye' forButton />
            </Button>
        </td>
    </tr>;
};
