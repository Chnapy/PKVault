
export type MoveContainerValue = {
    type: 'main-item' | 'save-item' | 'bank';
    bankId: string;
    saveId: number | null;
    boxId: string;
};

export type MoveParams = {
    attached: boolean;
};

const getContainerHash = ({ type, bankId, saveId, boxId }: MoveContainerValue): string => [ type, bankId, saveId, boxId ].join('---');

const getContainerValue = (hash: string): MoveContainerValue => {
    const [ type, bankId = '', saveIdRaw = '', boxId = '' ] = hash.split('---');

    const saveId = saveIdRaw === ''
        ? null
        : Number(saveIdRaw);

    return {
        type: type as MoveContainerValue[ 'type' ],
        bankId,
        saveId,
        boxId,
    };
};

export const containerFns = {
    getContainerHash,
    getContainerValue,
};
