import type { BoxDTO } from '../../../../data/sdk/model';
import type { storageGetBoxesResponseSuccess } from '../../../../data/sdk/storage/storage.gen';
import { type StorageSearchStorage } from '../../../../routes/storage';

export const getFinalBox = (
    storageIndex: number,
    storage: StorageSearchStorage,
    otherStorage: StorageSearchStorage | undefined,
    boxes: storageGetBoxesResponseSuccess | undefined,
    mainSelectedBoxes: BoxDTO[],
): BoxDTO | undefined => {
    const getRawBox = (storage: StorageSearchStorage) => {
        const boxIdRaw = storage?.boxId;

        if (boxIdRaw !== undefined)
            return boxes?.data.find(box => box.idInt === boxIdRaw);

        if (storage.saveId)
            return boxes?.data[ 0 ];

        return mainSelectedBoxes.length > 1
            ? mainSelectedBoxes[ storageIndex ]
            : mainSelectedBoxes[ 0 ];
    };

    const rawBox = getRawBox(storage);

    if (storageIndex === 1 && otherStorage?.saveId === storage.saveId) {
        const otherBox = getRawBox(otherStorage);
        if (rawBox && rawBox.id === otherBox?.id)
            return boxes?.data.find(box => box.id !== rawBox.id);
    }

    return rawBox;
};
