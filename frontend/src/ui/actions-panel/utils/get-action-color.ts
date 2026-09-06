import type { BadgeProps } from '@mantine/core';
import { DataActionType } from '../../../data/sdk/model';

export const getActionColor = (type: DataActionType): NonNullable<BadgeProps[ 'color' ]> => {
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
