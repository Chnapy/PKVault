import { DataActionType } from '../../../data/sdk/model';

export const useActionLabel = () => {
    return (type: DataActionType) => {
        switch (type) {
            case DataActionType.DATA_NORMALIZE: return 'Data normalize';
            case DataActionType.UPDATE_EXTERNAL_PKM: return 'Update external pkm';
            case DataActionType.MOVE_PKM: return 'Move pkm';
            case DataActionType.MAIN_CREATE_BANK: return 'Create bank';
            case DataActionType.MAIN_CREATE_BOX: return 'Create box';
            case DataActionType.MAIN_CREATE_PKM_VERSION: return 'Create pkm variant';
            case DataActionType.MAIN_UPDATE_BANK: return 'Update bank';
            case DataActionType.MAIN_UPDATE_BOX: return 'Update box';
            case DataActionType.EDIT_PKM_VERSION: return 'Update pkm variant';
            case DataActionType.EDIT_PKM_SAVE: return 'Update pkm';
            case DataActionType.EVOLVE_PKM: return 'Evolve pkm';
            case DataActionType.DETACH_PKM_SAVE: return 'Detach pkm';
            case DataActionType.DEX_SYNC: return 'Synchronize Pokedex';
            case DataActionType.SORT_PKM: return 'Sort pkms';
            case DataActionType.PKM_SYNCHRONIZE: return 'Synchronize pkms';
            case DataActionType.MAIN_DELETE_BANK: return 'Delete bank';
            case DataActionType.MAIN_DELETE_BOX: return 'Delete box';
            case DataActionType.SAVE_DELETE_PKM: return 'Delete pkm';
            case DataActionType.DELETE_PKM_VERSION: return 'Delete pkm variant';
        }
    };
};
