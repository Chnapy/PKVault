
export type MoveContainerValue =
    | {
        type: 'main-item';
        saveId?: undefined;
        boxId: string;
        bankId?: undefined;
    }
    | {
        type: 'save-item';
        saveId: number;
        boxId: string;
        bankId?: undefined;
    }
    | {
        type: 'bank';
        saveId?: undefined;
        boxId?: undefined;
        bankId: string;
    }
    | {
        type: 'inventory-item';
        saveId?: number;
        boxId: string;
        bankId?: undefined;
    };

export type MoveParams = {
    attached: boolean;
};

const getContainerHash = ({ type, saveId, boxId, bankId }: MoveContainerValue): string => {
    return [ type, saveId, boxId, bankId ].join('---');
};

const getContainerValue = (hash: string): MoveContainerValue => {
    const [ type, saveId, boxId = '', bankId = '', inventoryRaw = '' ] = hash.split('---');
    const inventory = Boolean(inventoryRaw);

    switch (type as MoveContainerValue[ 'type' ]) {
        case 'main-item':
            return {
                type: 'main-item',
                boxId,
            };
        case 'save-item':
            return {
                type: 'save-item',
                saveId: Number(saveId),
                boxId,
            };
        case 'bank':
            return {
                type: 'bank',
                bankId,
            };
        case 'inventory-item':
            return {
                type: 'inventory-item',
                saveId: saveId ? Number(saveId) : undefined,
                boxId,
            };
    }
};

export const containerFns = {
    getContainerHash,
    getContainerValue,
};
