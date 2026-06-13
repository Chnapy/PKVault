import type React from 'react';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { Route } from '../../../routes/storage';
import { UIStoragePanelGameList, type UIGameData } from '../../../ui-new/storage/storage-panel/game-list/ui-storage-panel-game-list';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useCurrentStorage } from '../storage-panel-context';
import { GameExpanded } from './game-expanded';
import { GamePkvaultExpanded } from './game-pkvault-expanded';

export const StoragePanelGameList: React.FC = () => {
    //   const { t } = useTranslate();

    const staticData = useStaticData();

    const { getStorage, setStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId });
    const navigate = Route.useNavigate();

    const saveInfosQuery = useSaveInfosGetAll();

    if (!saveInfosQuery.data) {
        return null;
    }

    const saveInfos = Object.values(saveInfosQuery.data.data)
        .filter(filterIsDefined)
        .sort((a, b) => a.lastWriteTime > b.lastWriteTime ? -1 : 1);

    const value = saveId !== undefined
        ? saveId?.toString() ?? 'pkvault'
        : '';

    const onChange = (id: string) => {
        const saveId = id === 'pkvault' ? null : Number(id);

        navigate({
            search: (search) => {
                return {
                    ...search,
                    storages: setStorage(search.storages, { saveId }),
                };
            },
        });
    };

    return <UIStoragePanelGameList
        value={value}
        data={[
            {
                id: 'pkvault',
                imgSrc: '/logo.svg',
                label: 'PKVault',
            },
            ...saveInfos.map(({ id, displayedVersion }): UIGameData => ({
                id: id.toString(),
                imgSrc: getGameInfos(displayedVersion).img,
                label: staticData.versions[ displayedVersion ]?.name ?? '',
            })),
        ]}
        onChange={onChange}
        renderExpanded={(data, { reduce }) => data.map(({ item, selected }) =>
            item.id === 'pkvault'
                ? <GamePkvaultExpanded
                    key={item.id}
                    {...item}
                    selected={selected}
                    onSelect={() => {
                        onChange(item.id);
                        reduce();
                    }}
                />
                : <GameExpanded
                    key={item.id}
                    {...item}
                    selected={selected}
                    onSelect={() => {
                        onChange(item.id);
                        reduce();
                    }}
                />)}
    />;
};
