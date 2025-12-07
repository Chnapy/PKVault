import React from 'react';
import { useStorageGetMainPkms, useStorageGetSavePkms } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import type { StorageItemProps } from '../../ui/storage-item/storage-item';
import { filterIsDefined } from '../../util/filter-is-defined';
import { BankContext } from '../bank/bank-context';
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

export const StorageSelectContext = {
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ value, setValue ] = React.useState<Context>({
            value: { ids: [] },
            setValue: (value) => setValue((context) => ({
                ...context,
                value,
            })),
        });

        return <context.Provider value={value}>
            <StorageSelectContext.SanityCheck />
            {children}
        </context.Provider>;
    },
    SanityCheck: () => {
        const { saveId, boxId, ids, removeId, clear } = StorageSelectContext.useValue();

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);
        const selectedBankBoxes = BankContext.useSelectedBankBoxes();

        const mainBoxIds = selectedBankBoxes.data?.selectedBoxes.map(box => box.idInt) ?? [];

        const selectsNotDisplayed = Route.useSearch({
            select: (search) => {
                if (ids.length === 0) {
                    return false;
                }

                if (saveId) {
                    return !search.saves?.[ saveId ]?.saveBoxIds.includes(boxId!);
                }

                return !(mainBoxIds ?? [ 0 ]).includes(boxId ?? 0);
            }
        });

        React.useEffect(() => {
            if (selectsNotDisplayed) {
                clear();
            } else {
                const pkmList = saveId
                    ? savePkmsQuery.data?.data ?? []
                    : mainPkmsQuery.data?.data ?? [];

                const obsoleteIds = ids.filter(id => !pkmList.find(pkm => pkm.id === id));
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

                if ((!value.saveId && value.ids.length === 0)
                    || (value.saveId !== saveId || value.boxId !== boxId)) {
                    setValue({
                        saveId,
                        boxId,
                        ids: [ ...pkmIds ]
                    });
                } else {
                    setValue({
                        saveId,
                        boxId,
                        ids: [ ...value.ids, ...pkmIds.filter(pkmId => !value.ids.includes(pkmId)) ]
                    });
                }
            },
            removeId: (pkmIds: string[]) => {
                if (pkmIds.length === 0) {
                    return;
                }

                const ids = value.ids.filter(id => !pkmIds.includes(id));
                setValue(ids.length > 0
                    ? { ...value, ids }
                    : { ids });
            },
            clear: () => {
                setValue({ ids: [] });
            },
        };
    },
    useCheck: (saveId: number | undefined, pkmId: string): Pick<StorageItemProps, 'checked' | 'onCheck'> => {
        const selectContext = StorageSelectContext.useValue();
        const movingIds = StorageMoveContext.useValue().selected?.ids;

        const mainPkmsQuery = useStorageGetMainPkms();
        const savePkmsQuery = useStorageGetSavePkms(saveId ?? 0);

        const pkmList = saveId
            ? savePkmsQuery.data?.data ?? []
            : mainPkmsQuery.data?.data ?? [];

        const pkm = pkmList.find(pkm => pkm.id === pkmId);

        const checked = selectContext.hasPkm(saveId, pkmId);

        return {
            checked,
            onCheck: pkm && (!movingIds || movingIds.includes(pkmId))
                ? ((e) => {
                    if (selectContext.hasPkm(saveId, pkmId)) {
                        selectContext.removeId([ pkmId ]);
                    } else {
                        if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.shiftKey) {
                            const selectedPkms = selectContext.ids.map(id => pkmList.find(pkm => pkm.id === id))
                                .filter(filterIsDefined);
                            const lastSelectedPkmSlot = selectedPkms[ selectedPkms.length - 1 ]?.boxSlot ?? -1;

                            const idsToAdd = pkmList
                                .filter(pk => {
                                    if (pk.boxId !== pkm.boxId) {
                                        return false;
                                    }

                                    if (lastSelectedPkmSlot < pkm.boxSlot) {
                                        return pk.boxSlot > lastSelectedPkmSlot
                                            && pk.boxSlot <= pkm.boxSlot;
                                    }

                                    return pk.boxSlot < lastSelectedPkmSlot
                                        && pk.boxSlot >= pkm.boxSlot;
                                })
                                .map(pk => pk.id) ?? [];

                            selectContext.addId(saveId, pkm.boxId, idsToAdd);
                        } else {
                            selectContext.addId(saveId, pkm.boxId, [ pkmId ]);
                        }
                    }
                })
                : undefined,
        };
    },
};
