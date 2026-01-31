import React from 'react';
import { usePkmSaveIndex } from '../../data/hooks/use-pkm-save-index';
import { usePkmVersionIndex } from '../../data/hooks/use-pkm-version-index';
import { usePkmVersionSlotInfos } from '../../data/hooks/use-pkm-version-slot-infos';
import { Route } from '../../routes/storage';
import type { StorageItemProps } from '../../ui/storage-item/storage-item';
import { filterIsDefined } from '../../util/filter-is-defined';
import { StorageMoveContext } from './storage-move-context';

type Context = {
    value: {
        saveId?: number;
        boxId?: number;
        ids: string[];
    };
    setValue: (value: Context[ 'value' ]) => void;
};

const context = React.createContext<Context>({
    value: { ids: [] },
    setValue: () => void 0,
});

/**
 * Select multiple pkms into a box, in PKVault or save storage.
 * Scoped to a single box at a time.
 */
export const StorageSelectContext = {
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ value, setValue ] = React.useState<Context>({
            value: { ids: [] },
            setValue: value =>
                setValue(context => ({
                    ...context,
                    value,
                })),
        });

        return (
            <context.Provider value={value}>
                <StorageSelectContext.SanityCheck />
                {children}
            </context.Provider>
        );
    },
    /**
     * Clear obsolete selection in some cases:
     * - select in another box
     * - selected pkm does not exist anymore
     */
    SanityCheck: () => {
        const { saveId, boxId, ids, removeId, clear } = StorageSelectContext.useValue();

        const mainPkmsQuery = usePkmVersionIndex();
        const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

        const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];

        const selectsNotDisplayed = Route.useSearch({
            select: search => {
                if (ids.length === 0) {
                    return false;
                }

                if (saveId) {
                    return !search.saves?.[ saveId ]?.saveBoxIds.includes(boxId!);
                }

                return !(mainBoxIds ?? [ 0 ]).includes(boxId ?? 0);
            },
        });

        React.useEffect(() => {
            if (selectsNotDisplayed) {
                clear();
            } else {
                const obsoleteIds = saveId
                    ? ids.filter(id => !savePkmsQuery.data?.data.byId[ id ])
                    : ids.filter(id => !mainPkmsQuery.data?.data.byId[ id ]);
                if (obsoleteIds.length > 0) {
                    removeId(obsoleteIds);
                }
            }
        }, [ selectsNotDisplayed, clear, removeId, ids, saveId, savePkmsQuery.data?.data, mainPkmsQuery.data?.data ]);

        return null;
    },
    useValue: () => {
        const { value, setValue } = React.useContext(context);

        const hasBox = (saveId: number | undefined, boxId: number) => value.saveId === saveId && value.boxId === boxId;

        return {
            saveId: value.saveId,
            boxId: value.boxId,
            ids: value.ids,
            hasBox,
            hasPkm: (saveId: number | undefined, pkmId: string) => value.saveId === saveId && value.ids.includes(pkmId),
            addId: (saveId: number | undefined, boxId: number, pkmIds: string[]) => {
                if (pkmIds.length === 0) {
                    return;
                }

                if ((!value.saveId && value.ids.length === 0) || value.saveId !== saveId || value.boxId !== boxId) {
                    setValue({
                        saveId,
                        boxId,
                        ids: [ ...pkmIds ],
                    });
                } else {
                    setValue({
                        saveId,
                        boxId,
                        ids: [ ...value.ids, ...pkmIds.filter(pkmId => !value.ids.includes(pkmId)) ],
                    });
                }
            },
            removeId: (pkmIds: string[]) => {
                if (pkmIds.length === 0) {
                    return;
                }

                const ids = value.ids.filter(id => !pkmIds.includes(id));
                setValue(ids.length > 0 ? { ...value, ids } : { ids });
            },
            clear: () => {
                setValue({ ids: [] });
            },
        };
    },
    /**
     * Get selection infos for given pkm.
     */
    useCheck: (saveId: number | undefined, pkmId: string): Pick<StorageItemProps, 'checked' | 'onCheck'> => {
        const selectContext = StorageSelectContext.useValue();
        const movingIds = StorageMoveContext.useValue().selected?.ids;

        const mainPkmsQuery = usePkmVersionIndex();
        const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

        const versionInfos = usePkmVersionSlotInfos(saveId ? undefined : pkmId);

        const getInfos = () => {
            if (saveId) {
                const pkm = savePkmsQuery.data?.data.byId[ pkmId ];

                return {
                    pkm,
                    pkmStack: [ pkm ].filter(filterIsDefined),
                    getPkmsByBox: (boxId: number) => Object.values(savePkmsQuery.data?.data.byBox[ boxId ] ?? {}),
                };
            }

            return {
                pkm: versionInfos?.baseVersion,
                pkmStack: versionInfos?.versions ?? [],
                getPkmsByBox: (boxId: number) => Object.values(mainPkmsQuery.data?.data.byBox[ boxId ] ?? {}).flat(),
            };
        };

        const { pkm, pkmStack, getPkmsByBox } = getInfos();

        const pkmIds = pkmStack.map(pk => pk.id);

        const checked = selectContext.hasPkm(saveId, pkmId);

        return {
            checked,
            onCheck:
                pkm && (!movingIds || movingIds.includes(pkmId))
                    ? e => {
                        if (selectContext.hasPkm(saveId, pkmId)) {
                            selectContext.removeId(pkmIds);
                        } else {
                            if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.shiftKey) {
                                const pkmsInBox = getPkmsByBox(pkm.boxId);
                                const selectedPkms = selectContext.ids.map(id => pkmsInBox.find(pkm => pkm.id === id)).filter(filterIsDefined);
                                const lastSelectedPkmSlot = selectedPkms[ selectedPkms.length - 1 ]?.boxSlot ?? -1;

                                const idsToAdd =
                                    pkmsInBox
                                        .filter(pk => {
                                            if (lastSelectedPkmSlot < pkm.boxSlot) {
                                                return pk.boxSlot > lastSelectedPkmSlot && pk.boxSlot <= pkm.boxSlot;
                                            }

                                            return pk.boxSlot < lastSelectedPkmSlot && pk.boxSlot >= pkm.boxSlot;
                                        })
                                        .map(pk => pk.id) ?? [];

                                selectContext.addId(saveId, pkm.boxId, idsToAdd);
                            } else {
                                selectContext.addId(saveId, pkm.boxId, pkmIds);
                            }
                        }
                    }
                    : undefined,
        };
    },
};
