import type React from 'react';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { Route } from '../../../routes/storage';
import { UIStoragePanelGameList, type UIGameData } from '../../../ui-new/storage/storage-panel/game-list/ui-storage-panel-game-list';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useFilteredBoxes } from '../hooks/use-filtered-boxes';
import { useCurrentStorage, useOtherStorage } from '../storage-panel-context';
import { GameExpanded } from './game-expanded';
import { GamePkvaultExpanded } from './game-pkvault-expanded';

const pkvaultStorageId = 'pkvault';

export const StoragePanelGameList: React.FC = () => {
    //   const { t } = useTranslate();

    const staticData = useStaticData();

    const { getStorage, setStorage } = useCurrentStorage();
    const otherStorage = useOtherStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId });
    const navigate = Route.useNavigate();

    const saveInfosQuery = useSaveInfosGetAll();

    const pkvaultBoxesQuery = useFilteredBoxes(null);

    const disabledPkvault = Route.useSearch({
        select: (search) => {
            return otherStorage.getStorage(search.storages)?.saveId === null && pkvaultBoxesQuery.data?.data.length === 1;
        }
    });

    if (!saveInfosQuery.data) {
        return null;
    }

    const saveInfos = Object.values(saveInfosQuery.data.data)
        .filter(filterIsDefined)
        .sort((a, b) => a.lastWriteTime > b.lastWriteTime ? -1 : 1);

    const value = saveId !== undefined
        ? saveId?.toString() ?? pkvaultStorageId
        : '';

    const onChange = (id: string) => {
        const saveId = id === pkvaultStorageId ? null : Number(id);

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
                id: pkvaultStorageId,
                imgSrc: '/logo.svg',
                label: 'PKVault',
                disabled: disabledPkvault,
            },
            ...saveInfos.map(({ id, displayedVersion }): UIGameData => ({
                id: id.toString(),
                imgSrc: getGameInfos(displayedVersion).img,
                label: staticData.versions[ displayedVersion ]?.name ?? '',
            })),
        ]}
        onChange={onChange}
        expanded={value === '' ? true : undefined}
        renderHoverCard={({ item, selected }, { reduce }) => item.id === pkvaultStorageId
            ? <GamePkvaultExpanded
                {...item}
                onSelect={() => {
                    if (!selected)
                        onChange(item.id);
                    reduce();
                }}
            />
            : <GameExpanded
                {...item}
                onSelect={() => {
                    if (!selected)
                        onChange(item.id);
                    reduce();
                }}
            />}
        renderExpanded={(data, { reduce }) => data.map(({ item, selected }) =>
            item.id === pkvaultStorageId
                ? <GamePkvaultExpanded
                    key={item.id}
                    {...item}
                    selected={selected}
                    onSelect={item.disabled
                        ? undefined
                        : (() => {
                            onChange(item.id);
                            reduce();
                        })}
                />
                : <GameExpanded
                    key={item.id}
                    {...item}
                    selected={selected}
                    onSelect={item.disabled
                        ? undefined
                        : (() => {
                            onChange(item.id);
                            reduce();
                        })}
                />)}
    />;
};
