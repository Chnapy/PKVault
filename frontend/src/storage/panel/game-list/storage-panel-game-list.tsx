import { Group } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { ArrowDown01Icon, FolderSearchIcon, SortDescIcon } from 'lucide-react';
import type React from 'react';
import type { SaveInfosDTO } from '../../../data/sdk/model';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStaticData } from '../../../hooks/use-static-data';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { Route } from '../../../routes/storage';
import { SavesUploadButton } from '../../../saves/saves-upload-popover/saves-upload-button';
import { isDesktop } from '../../../settings/globs-input/hooks/use-desktop-message';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../../ui/form/button/ui-button';
import type { UISelectItem } from '../../../ui/form/select/ui-select';
import { UIStoragePanelGameList, type UIGameData } from '../../../ui/storage/storage-panel/game-list/ui-storage-panel-game-list';
import { gameExpandedConstants } from '../../../ui/storage/storage-panel/game-list/util/game-expanded-constants';
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

    const value = saveId !== undefined
        ? saveId?.toString() ?? pkvaultStorageId
        : '';

    const disabledPkvault = Route.useSearch({
        select: (search) => {
            if (value === pkvaultStorageId)
                return false;

            return pkvaultBoxesQuery.isPending
                || (otherStorage.getStorage(search.storages)?.saveId === null && pkvaultBoxesQuery.data?.data.length === 1);
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
        createActions={<Group justify='center' wrap='nowrap'>
            {isDesktop
                ? <>
                    <UIButton
                        name='add-game-path'
                        controlLabel={t('settings.form.saves.add-path')}
                        onClick={() => navigate({
                            to: '/settings'
                        })}
                        leftSection={<FolderSearchIcon />}
                        p='sm'
                        w={gameExpandedConstants.width}
                        fullWidth
                        mih={60}
                        variant='filled'
                        color='blue'
                        styles={{
                            inner: {
                                flexDirection: 'column',
                                gap: 10,
                            },
                            label: {
                                height: 'auto',
                            },
                        }}
                    >
                        {t('settings.form.saves.add-path')}
                    </UIButton>
                </>
                : <>
                    <UIButton
                        name='add-game-path'
                        controlLabel={t('saves.action.add-path')}
                        onClick={() => navigate({
                            to: '/settings'
                        })}
                        leftSection={<FolderSearchIcon />}
                        p='sm'
                        w={gameExpandedConstants.width}
                        mih={60}
                        variant='filled'
                        color='blue'
                        styles={{
                            inner: {
                                flexDirection: 'column',
                                gap: 10,
                            },
                            label: {
                                height: 'auto',
                            },
                        }}
                    >
                        {t('saves.action.add-path')}
                    </UIButton>

                    <SavesUploadButton
                        disabledLabel={t('action.not-possible')}
                        p='sm'
                        w={gameExpandedConstants.width}
                        mih={60}
                        styles={{
                            inner: {
                                flexDirection: 'column',
                                gap: 10,
                            },
                            label: {
                                height: 'auto',
                            },
                        }}
                    />
                </>}
        </Group>}
    />;
};
