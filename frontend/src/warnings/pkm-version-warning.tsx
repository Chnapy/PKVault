import type React from 'react';
import type { PkmVersionWarning as PkmVersionWarningModel } from '../data/sdk/model';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { Route } from '../routes/storage';
import { Button } from '../ui/button/button';
import { Icon } from '../ui/icon/icon';

export const PkmVersionWarning: React.FC<PkmVersionWarningModel> = ({ pkmId }) => {
    const navigate = Route.useNavigate();

    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkm = pkmsQuery.data?.data.find(pkm => pkm.id == pkmId);
    const pkmVersion = pkmVersionsQuery.data?.data.find(pkmVersion => pkmVersion.pkmId === pkmId);

    if (!pkm) {
        return null;
    }

    return <tr>
        <td>
            Pkm {pkmVersion?.speciesName} in box {pkm.boxId} slot {pkm.boxSlot} not found in attached save.
        </td>
        <td style={{ verticalAlign: 'top' }}>
            <Button onClick={() => navigate({
                to: '/storage',
                search: {
                    mainBoxId: pkm.boxId,
                    save: pkm.saveId,
                    saveBoxId: undefined,
                    selected: {
                        type: 'main',
                        id: pkm.id,
                    },
                }
            })}>
                <Icon name='eye' forButton />
            </Button>
        </td>
    </tr>;
};
