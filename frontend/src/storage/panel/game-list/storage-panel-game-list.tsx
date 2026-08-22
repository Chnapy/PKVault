import { useLocalStorage } from '@mantine/hooks';
import { ArrowDown01Icon, SortDescIcon } from 'lucide-react';
import type React from 'react';
import type { SaveInfosDTO } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { Route } from '../../../routes/storage';
import { useTranslate } from '../../../translate/i18n';
import type { UISelectItem } from '../../../ui/form/select/ui-select';
import { UIStoragePanelGameList, type UIGameData } from '../../../ui/storage/storage-panel/game-list/ui-storage-panel-game-list';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useFilteredBoxes } from '../hooks/use-filtered-boxes';
import { useCurrentStorage, useOtherStorage } from '../storage-panel-context';
import { GameExpanded } from './game-expanded';
import { GamePkvaultExpanded } from './game-pkvault-expanded';

type SavesSort = 'last-modified' | 'generation' | 'play-time';

const pkvaultStorageId = 'pkvault';

const sortFns: Record<SavesSort, (a: SaveInfosDTO, b: SaveInfosDTO) => number> = {
    'last-modified': (a, b) => a.lastWriteTime > b.lastWriteTime ? -1 : 1,
    'generation': (a, b) => {
        if (a.generation !== b.generation)
            return a.generation - b.generation;

        return a.displayedVersion - b.displayedVersion;
    },
    'play-time': (a, b) => b.playTimeInSeconds - a.playTimeInSeconds,
};

export const StoragePanelGameList: React.FC = () => {
    const { t } = useTranslate();

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

    const sortData: UISelectItem<SavesSort>[] = [
        {
            value: 'last-modified',
            label: t('storage.games.sort.last-modified'),
            icon: <SortDescIcon />,
        },
        {
            value: 'generation',
            label: t('storage.games.sort.generation'),
            icon: <ArrowDown01Icon />,
        },
        {
            value: 'play-time',
            label: t('storage.games.sort.play-time'),
            icon: <SortDescIcon />,
        },
    ];

    const [ savesSort, setSavesSort ] = useLocalStorage<SavesSort>({
        key: 'saves-sort',
        defaultValue: 'last-modified',
    });

    if (!saveInfosQuery.data) {
        return null;
    }

    const saveInfos = Object.values(saveInfosQuery.data.data)
        .filter(filterIsDefined)
        .sort(sortFns[ savesSort ]);

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
            ...saveInfos.map(({ id, displayedVersion, duplicates }): UIGameData => ({
                id: id.toString(),
                imgSrc: getGameInfos(displayedVersion).img,
                label: staticData.versions[ displayedVersion ]?.name ?? '',
                hasDuplicates: duplicates.length > 0,
            })),
        ]}
        onChange={onChange}
        expanded={value === '' ? true : undefined}
        sortValue={savesSort}
        sortData={sortData}
        onSortChange={(v: SavesSort) => setSavesSort(v)}
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
                    disabled={item.disabled}
                    onSelect={item.disabled
                        ? undefined
                        : (() => {
                            onChange(item.id);
                            reduce();
                        })}
                />)}
        onCreate={() => navigate({
            to: '/settings'
        })}
    />;
};
