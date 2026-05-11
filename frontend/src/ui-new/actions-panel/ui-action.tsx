import type React from 'react';
import { DataActionType } from '../../data/sdk/model';
import { Badge, type BadgeProps } from '@mantine/core';

export type UIActionProps = {
    type: DataActionType;
    // params: unknown[];
};

export const UIAction: React.FC<UIActionProps> = ({ type }) => {

    const getTypeStr = (): string => {
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

    return <Badge variant='dot' color={getColor(type)} size='lg' fz='md' fw='normal' tt='initial'>{getTypeStr()}</Badge>;
};

const getColor = (type: DataActionType): NonNullable<BadgeProps[ 'color' ]> => {
    switch (type) {
        case DataActionType.DATA_NORMALIZE:
        case DataActionType.UPDATE_EXTERNAL_PKM:
            return 'primary';
        case DataActionType.MOVE_PKM:
            return 'gray';
        case DataActionType.MAIN_CREATE_BANK:
        case DataActionType.MAIN_CREATE_BOX:
        case DataActionType.MAIN_CREATE_PKM_VERSION:
            return 'green';
        case DataActionType.MAIN_UPDATE_BANK:
        case DataActionType.MAIN_UPDATE_BOX:
        case DataActionType.EDIT_PKM_VERSION:
        case DataActionType.EDIT_PKM_SAVE:
        case DataActionType.EVOLVE_PKM:
        case DataActionType.DETACH_PKM_SAVE:
        case DataActionType.DEX_SYNC:
        case DataActionType.SORT_PKM:
        case DataActionType.PKM_SYNCHRONIZE:
            return 'blue';
        case DataActionType.MAIN_DELETE_BANK:
        case DataActionType.MAIN_DELETE_BOX:
        case DataActionType.SAVE_DELETE_PKM:
        case DataActionType.DELETE_PKM_VERSION:
            return 'red';
    }
};
