import type React from 'react';
import { Gender } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { Route } from '../../../routes/storage';
import type { UIGameData } from '../../../ui-new/storage/storage-panel/game-list/ui-game-expanded';
import { UIStoragePanelGameList } from '../../../ui-new/storage/storage-panel/game-list/ui-storage-panel-game-list';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelGameList: React.FC = () => {
    //   const { t } = useTranslate();

    const staticData = useStaticData();

    const { getStorage, setStorage } = useCurrentStorage();
    const storage = Route.useSearch({ select: (search) => getStorage(search.storages) });
    const navigate = Route.useNavigate();

    const saveInfosQuery = useSaveInfosGetAll();

    if (!saveInfosQuery.data) {
        return null;
    }

    const saveInfos = Object.values(saveInfosQuery.data.data)
        .filter(filterIsDefined)
        .sort((a, b) => a.lastWriteTime > b.lastWriteTime ? -1 : 1);

    const value = storage
        ? storage.saveId?.toString() ?? 'pkvault'
        : '';

    return <UIStoragePanelGameList
        value={value}
        data={[
            {
                id: 'pkvault',
                imgSrc: '/logo.svg',
                label: 'PKVault',
                ot: '',
                otGender: Gender.Genderless,
                tid: 0,
                lastSync: '',
                path: '',
            },
            ...saveInfos.map(({ id, version, trainerName, trainerGender, tid, lastWriteTime, path }): UIGameData => ({
                id: id.toString(),
                imgSrc: getGameInfos(version).img,
                label: staticData.versions[ version ]?.name ?? '',
                ot: trainerName,
                otGender: trainerGender,
                tid,
                lastSync: lastWriteTime,
                path,
            })),
        ]}
        onChange={id => {
            const saveId = id === 'pkvault' ? null : Number(id);

            navigate({
                search: (search) => {
                    return {
                        ...search,
                        storages: setStorage(search.storages, { saveId }),
                    };
                },
            });
        }}
    />;
};
