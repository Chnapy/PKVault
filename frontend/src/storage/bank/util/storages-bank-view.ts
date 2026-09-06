import type { BankView, BankViewSave } from '../../../data/sdk/model';
import type { StorageSearchStorage } from '../../../routes/storage';
import { filterIsDefined } from '../../../util/filter-is-defined';

export const StorageBankView = {
    getStoragesFromBankView: (bankView: BankView, defaultBoxId?: number): StorageSearchStorage[] => {
        const mainStorages: StorageSearchStorage[] = bankView.mainBoxIds.map((boxId) => ({
            saveId: null,
            boxId,
        }));

        const savesStorages: StorageSearchStorage[] = bankView.saves.map((save) => ({
            saveId: save.saveId,
            boxId: save.saveBoxIds[ 0 ],
        }));

        const storages = [
            ...mainStorages,
            ...savesStorages,
        ].slice(0, 2);

        if (storages.length === 0) {
            storages.push({
                saveId: null,
                boxId: defaultBoxId,
            });
        }

        return storages;
    },
    getBankViewFromStorages: (storages: StorageSearchStorage[]): BankView => {
        const mainBoxIds = storages
            .filter(({ saveId }) => !saveId)
            .map(({ boxId }) => boxId)
            .filter(filterIsDefined);

        const saves = storages
            .filter(({ saveId }) => saveId)
            .reduce<Record<number, BankViewSave>>((acc, { saveId, boxId }, i) => ({
                ...acc,
                [ saveId! ]: {
                    order: i,
                    saveId: saveId!,
                    ...acc[ saveId! ],
                    saveBoxIds: [
                        ...acc[ saveId! ]?.saveBoxIds ?? [],
                        boxId
                    ].filter(filterIsDefined),
                },
            }), {});

        return {
            mainBoxIds,
            saves: Object.values(saves),
        };
    },
};
